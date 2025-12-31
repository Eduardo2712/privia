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
        const topK = Math.min(6, chunks.length);
        const context = chunks
            .slice(0, topK)
            .map((c, i) => {
                let text = c.text.replace(/\s+/g, " ").trim();
                if (text.length > 800) {
                    const trimmed = text.substring(0, 800);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > 600 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }
                return `[${i + 1}] ${text}`;
            })
            .join("\n\n");

        const prompt = `Responda baseado APENAS nos trechos abaixo.

REGRAS:
- Responda em português de forma clara e completa
- Use SOMENTE informações dos trechos fornecidos
- CITE [número] quando usar informação de um trecho
- Se for narrativa/literatura, preserve o contexto e tom
- Se não encontrar informação relevante: "Informação não encontrada nos trechos."

TRECHOS:
${context}

PERGUNTA: ${search}

RESPOSTA:`;

        return this.sendPromptStream(prompt);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const clean = text.replace(/\s+/g, " ").trim();
        const sample = this.extractSample(clean, 2500);

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
                temperature: 0.2,
                top_p: 0.7,
                repeat_penalty: 1.1,
                max_tokens: 300
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
        if (text.length <= maxLen) return text;

        const partLen = Math.floor(maxLen / 3);
        const start = text.slice(0, partLen);
        const midStart = Math.floor(text.length / 2) - Math.floor(partLen / 2);
        const middle = text.slice(midStart, midStart + partLen);
        const end = text.slice(-partLen);

        return `${start}\n[...]\n${middle}\n[...]\n${end}`;
    }
}

