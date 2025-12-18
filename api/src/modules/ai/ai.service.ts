import { Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AIGenerateSummaryAndSuggestions } from "./interfaces/ai.interface";

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

        const filtered = chunks.filter((c) => c.score >= 0.65);
        const candidates = filtered.length > 0 ? filtered : chunks;
        const useChunks = typeof kVal === "number" && kVal > 0 ? candidates.slice(0, Math.min(kVal, candidates.length)) : candidates;

        const fullChunks = useChunks
            .map((c, i) => {
                const maxLen = 800;
                let text = c.text.replaceAll(/\s+/g, " ").trim();

                if (text.length > maxLen) {
                    const trimmed = text.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > maxLen * 0.7 ? trimmed.substring(0, lastPeriod + 1) : trimmed;
                }

                return `[Trecho ${i + 1}]\n${text}\n`;
            })
            .join("\n---\n\n");

        const prompt = `Você responde apenas com base nos trechos.

        Foque em:
        - Citar trechos como [N].
        - Não usar conhecimento externo.
        - Separar Fatos e Inferências.

        Saída:
        Fatos:
        - ...
        Inferências (sempre citar [N][M]):
        - ...
        Observações narrativas (se houver):
        - ...
        Trechos:
        ${fullChunks}

        Pergunta: ${search}

        Resposta:`;

        return this.sendPromptStream(prompt);
    }

    private autoDecide(chunks: Array<{ score: number; text: string }>): { promptMode: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k: number } {
        const promptMode = "STRICT_QUOTE" as const;
        const k = Math.min(5, chunks.length);

        return { promptMode, k };
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const limit = 3000;
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Você é um assistente que resume textos e cria perguntas abertas.

        TAREFA:
        - Resuma o texto fornecido em português.
        - Gere exatamente 3 perguntas abertas e relevantes sobre o texto.

        REGRAS:
        - Use somente o conteúdo do texto; não invente fatos.
        - Resumo com até 5 frases curtas e objetivas.
        - Perguntas distintas entre si, claras e que estimulem aprofundamento.
        - Responda APENAS no formato abaixo.

        FORMATO DE SAÍDA:
        Resumo:
        - ...

        Perguntas:
        1. ...
        2. ...
        3. ...

        TEXTO:
        ${chunk}`;

        const result = this.sendPrompt<AIGenerateSummaryAndSuggestions>({
            prompt,
            options: {
                temperature: 0,
                top_p: 0.4,
                repeat_penalty: 1.1,
                max_tokens: 120
            },
            format: {
                type: "object",
                properties: {
                    resumo: { type: "string" },
                    perguntas: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["resumo", "perguntas"]
            }
        });

        return result;
    }
}

