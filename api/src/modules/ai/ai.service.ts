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
        return this.searchEmbedding({ prompt: text });
    }

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const topK = Math.min(4, chunks.length);
        const context = chunks
            .slice(0, topK)
            .map((c, i) => {
                let text = c.text.replace(/\s+/g, " ").trim();
                if (text.length > 500) {
                    const trimmed = text.substring(0, 500);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > 400 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }
                return `[${i + 1}] ${text}`;
            })
            .join("\n\n");

        const prompt = `Responda baseado APENAS nos trechos abaixo.

REGRAS IMPORTANTES:
- Responda em português
- Use SOMENTE informações dos trechos
- CITE [número] ao usar um trecho
- Máximo 5 linhas
- Se não encontrar informação, responda: "Informação não encontrada nos trechos."

TRECHOS:
${context}

PERGUNTA: ${search}

RESPOSTA:`;

        return this.sendPromptStream(prompt);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const limit = 2000;
        const clean = text.replace(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Resuma em 2 frases concisas e crie 3 perguntas relevantes sobre o conteúdo.

FORMATO EXATO:
Resumo:
[2 frases]

Perguntas:
1. [pergunta 1]
2. [pergunta 2]
3. [pergunta 3]

TEXTO:
${chunk}`;

        return this.sendPrompt<AIGenerateSummaryAndSuggestions>({
            prompt,
            options: {
                temperature: 0.1,
                top_p: 0.5,
                repeat_penalty: 1.1,
                max_tokens: 200
            },
            format: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    questions: { type: "array", items: { type: "string" } }
                },
                required: ["summary", "questions"]
            }
        });
    }
}

