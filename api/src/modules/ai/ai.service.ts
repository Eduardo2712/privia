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

        const sorted = [...chunks].sort((a, b) => b.score - a.score);
        const strong = sorted.filter((c) => c.score >= 0.75);
        const candidates = strong.length > 0 ? strong : sorted;
        const useChunks = typeof kVal === "number" && kVal > 0 ? candidates.slice(0, Math.min(kVal, candidates.length)) : candidates;

        const fullChunks = useChunks
            .map((c, i) => {
                const maxLen = 500;
                let text = c.text.replaceAll(/\s+/g, " ").trim();

                if (text.length > maxLen) {
                    const trimmed = text.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > maxLen * 0.7 ? trimmed.substring(0, lastPeriod + 1) : trimmed;
                }

                return `[Trecho ${i + 1}]\n${text}\n`;
            })
            .join("\n---\n\n");

        const prompt = `Responda somente com base nos trechos abaixo.

        Regras:
        - Seja extremamente conciso (3-6 linhas no total).
        - Sempre cite os trechos como [N] quando afirmar algo.
        - Não use conhecimento externo nem suponha fatos não presentes.
        - Se a informação não estiver nos trechos, responda: "Não encontrado nos trechos.".

        Trechos:
        ${fullChunks}

        Pergunta: ${search}

        Resposta:`;

        return this.sendPromptStream(prompt);
    }

    private autoDecide(chunks: Array<{ score: number; text: string }>): { promptMode: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k: number } {
        const promptMode = "STRICT_QUOTE" as const;
        const k = Math.min(3, chunks.length);

        return { promptMode, k };
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const limit = 2000;
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Você é um assistente que resume textos e cria perguntas abertas.

        TAREFA:
        - Resuma o texto fornecido em português em no máximo 3 frases curtas.
        - Gere exatamente 3 perguntas abertas, claras e distintas sobre o texto.

        REGRAS:
        - Use somente o conteúdo do texto; não invente fatos.
        - Seja objetivo e preciso.
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
                top_p: 0.2,
                repeat_penalty: 1.05,
                max_tokens: 100
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

