import { Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { sanitize } from "../../common/utils/functions.util";

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

    public async generateResponse(chunks: Array<{ score: number; text: string }>, search: string): Promise<string> {
        const K = Math.min(8, chunks.length);
        const unique = Array.from(new Map(chunks.sort((a, b) => b.score - a.score).map((c) => [c.text.trim(), c])).values()).slice(0, K);

        const sorted = unique.map((c, i) => `${i + 1}. ${sanitize(c.text)}`).join("\n\n");

        const prompt = [
            "Você é um assistente em português. Responda SOMENTE com base nos trechos.",
            '- Se a resposta não estiver nos trechos, responda exatamente: "Informação não encontrada nos trechos."',
            "- Seja direto e preciso.",
            "- Não invente fatos nem use fontes externas.",
            '- Se a informação for incompleta, responda o que houver e marque como "parcial".',
            '- Se houver contradição, diga: "informação conflitante nos trechos".',
            "",
            "Trechos numerados:",
            sorted,
            "",
            "Pergunta:",
            search,
            "",
            "Resposta (inclua referências como [1], [2] quando útil):"
        ].join("\n");

        return this.sendPrompt(prompt);
    }
}

