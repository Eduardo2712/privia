import { Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiService extends BaseAiService {
    constructor(
        readonly http: HttpService,
        readonly configService: ConfigService
    ) {
        super(http, configService);
    }

    public async getEmbedding(text: string): Promise<number[]> {
        const embedding = await this.searchEmbedding({ prompt: text });

        return embedding;
    }

    public async rerankChunksByRelevance(
        chunks: Array<{ score: number; text: string }>,
        search: string
    ): Promise<Array<{ score: number; text: string }>> {
        const aux = chunks.sort((a, b) => b.score - a.score).slice(0, 10);

        const prompt = [
            "Você é um assistente especializado em ranqueamento de trechos.",
            "",
            "TAREFA:",
            "Com base na consulta fornecida, reordene os trechos abaixo pelo nível de relevância.",
            "Retorne SOMENTE uma lista de números separados por vírgulas. Nada mais.",
            "",
            "Exemplo de resposta válida:",
            "1, 3, 2",
            "",
            "Consulta:",
            search,
            "",
            "Trechos:",
            aux.map((c, i) => `${i + 1}. ${c.text}`).join("\n"),
            "",
            "Resposta:"
        ].join("\n");

        const stream = await this.sendPromptStream(prompt);

        let responseText = "";

        for await (const chunk of stream) {
            responseText += chunk;
        }

        const matches = responseText.match(/\b\d+\b/g);

        if (!matches) {
            return chunks;
        }

        const seen = new Set<number>();
        const rankedIndexes = matches
            .map((n) => parseInt(n, 10) - 1)
            .filter((i) => i >= 0 && i < chunks.length)
            .filter((i) => {
                if (seen.has(i)) {
                    return false;
                }

                seen.add(i);

                return true;
            });

        if (rankedIndexes.length === 0) {
            return chunks;
        }

        return rankedIndexes.map((i) => chunks[i]);
    }

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const sorted = chunks.map((c, i) => `${i + 1}. ${c.text}`).join("\n\n");

        const prompt = `
            Você é um assistente especializado em responder usando exclusivamente os trechos numerados.
            Responda objetivamente, cite trechos usados entre colchetes [n], onde n é o número do trecho, e não invente nada. Somente use os trechos fornecidos e que estejam diretamente relacionados à pergunta.

            TRECHOS:
            ${sorted}

            PERGUNTA:
            ${search}

            RESPOSTA:
            `;

        return this.sendPromptStream(prompt);
    }
}

