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

    public async generateResponseStream(
        chunks: Array<{ score: number; text: string }>,
        search: string,
        opts?: { promptMode?: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k?: number }
    ): Promise<AsyncIterable<string>> {
        const auto = this.autoDecide(chunks);
        const kVal = typeof opts?.k === "number" && opts.k > 0 ? opts.k : auto.k;

        const useChunks = typeof kVal === "number" && kVal > 0 ? chunks.slice(0, Math.min(kVal, chunks.length)) : chunks;

        const fullChunks = useChunks
            .map((c, i) => {
                const maxLen = 1100;
                let text = c.text;

                if (text.length > maxLen) {
                    const trimmed = text.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > maxLen * 0.8 ? trimmed.substring(0, lastPeriod + 1) : trimmed;
                }

                return `[Trecho ${i + 1}]\n${text}\n`;
            })
            .join("\n---\n\n");

        const prompt = `Você é um assistente de análise textual baseado em evidências.

                REGRAS:
                - Use exclusivamente os trechos fornecidos.
                - Inferências são permitidas APENAS quando sustentadas por múltiplos trechos.
                - Não utilize conhecimento externo sobre a obra ou o autor.
                - Diferencie claramente fatos do texto e interpretações.

                FORMATO DE SAÍDA:

                Fatos explícitos:
                - Liste objetivamente o que os trechos afirmam, com citações [N].

                Inferências sustentadas:
                - Apresente conclusões que derivem diretamente da combinação dos fatos acima.
                - Cada inferência deve citar pelo menos dois trechos [N][M].
                
                Observações narrativas (se aplicável):
                - Elementos recorrentes de comportamento, tom ou relação, desde que evidentes no texto.

                RECHOS:
                ${fullChunks}

                PERGUNTA: ${search}

                RESPOSTA:
                `;

        return this.sendPromptStream(prompt);
    }

    private autoDecide(chunks: Array<{ score: number; text: string }>): { promptMode: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k: number } {
        const promptMode = "STRICT_QUOTE" as const;
        const k = Math.min(5, chunks.length);

        return { promptMode, k };
    }

    public async generateSummary(text: string): Promise<string> {
        const limit = 3000;
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Resuma em 2-3 frases:

        ${chunk}`;

        return this.sendPrompt(prompt, 120);
    }
}

