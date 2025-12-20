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
        const topK = Math.min(3, chunks.length);
        const useChunks = chunks.slice(0, topK);

        const context = useChunks
            .map((c, i) => {
                const maxLen = 400;
                let text = c.text.replaceAll(/\s+/g, " ").trim();
                if (text.length > maxLen) {
                    text = text.substring(0, maxLen).trim();
                    const lastPeriod = text.lastIndexOf(".");
                    if (lastPeriod > maxLen * 0.8) {
                        text = text.substring(0, lastPeriod + 1);
                    }
                }
                return `[${i + 1}] ${text}`;
            })
            .join("\n\n");

        const prompt = `Responda baseado nos trechos abaixo.

REGRAS:
- Use SOMENTE informações dos trechos
- Cite [número] ao usar um trecho
- Se não encontrar, responda: "Informação não encontrada"
- Máximo 3 linhas

TRECHOS:
${context}

PERGUNTA: ${search}

RESPOSTA:`;

        return this.sendPromptStream(prompt);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const limit = 1500;
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Resuma em 2 frases e crie 3 perguntas relevantes.

FORMATO:
Resumo:
[2 frases]

Perguntas:
1. [pergunta]
2. [pergunta]
3. [pergunta]

TEXTO:
${chunk}`;

        const result = this.sendPrompt<AIGenerateSummaryAndSuggestions>({
            prompt,
            options: {
                temperature: 0,
                top_p: 0.3,
                repeat_penalty: 1.1,
                max_tokens: 150
            },
            format: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    questions: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["summary", "questions"]
            }
        });

        return result;
    }
}

