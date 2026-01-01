import { Inject, Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AIGenerateSummaryAndSuggestions } from "./interfaces/ai.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class AiService extends BaseAiService {
    constructor(
        readonly http: HttpService,
        readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) readonly cacheManager: Cache
    ) {
        super(http, configService, cacheManager);
    }

    public async getEmbedding(text: string): Promise<number[]> {
        return this.searchEmbedding({ prompt: text });
    }

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const topK = Math.min(4, chunks.length);
        const context = chunks
            .slice(0, topK)
            .map((c, i) => {
                let text = c.text.replaceAll(/\s+/g, " ").trim();
                if (text.length > 600) {
                    const trimmed = text.substring(0, 600);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > 400 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }
                return `[${i + 1}] ${text}`;
            })
            .join("\n");

        const prompt = `Responda a pergunta usando APENAS os trechos numerados abaixo.

Regras:
- Responda em português, de forma clara e objetiva
- Cite [número] para cada informação usada
- Use apenas informações dos trechos
- Se nenhum trecho contiver a resposta, diga apenas: "Não encontrei essa informação no documento."
- NÃO misture resposta com aviso de não encontrado

Trechos:
${context}

Pergunta: ${search}

Resposta:`;

        return this.sendPromptStream(prompt);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const sample = this.extractSample(clean, 5000);

        const prompt = `Analise o texto e forneça um resumo e perguntas relevantes.

INSTRUÇÕES:
- Resumo: 2-3 frases capturando a essência do conteúdo
- Perguntas: 3 perguntas que um leitor faria sobre o texto
- Se for literatura/narrativa, foque em personagens, enredo e temas
- Se for documentação/técnico, foque em conceitos e aplicações

TEXTO:
${sample}`;

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

    private extractSample(text: string, maxLen: number): string {
        if (text.length <= maxLen) {
            return text;
        }

        return text.slice(0, maxLen);
    }
}

