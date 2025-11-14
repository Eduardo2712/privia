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
        const embedding = await this.sendEmbedding({ prompt: text });

        return embedding;
    }

    public async generateResponse(chunks: Array<{ score: number; text: string }>, search: string): Promise<string> {
        const sortedChunks = [...chunks].sort((a, b) => b.score - a.score);
        const context = sortedChunks.map((c, i) => `[Trecho ${i + 1} | Relevância: ${(c.score * 100).toFixed(1)}%]\n${c.text}`).join("\n\n---\n\n");

        const prompt =
            `Analise os trechos do documento abaixo (ordenados por relevância) e responda a pergunta com base APENAS nas informações fornecidas.

${context}

---

PERGUNTA: ${search}

INSTRUÇÕES:
• Responda de forma direta e objetiva
• Use SOMENTE informações dos trechos acima
• Se a resposta estiver em múltiplos trechos, sintetize-os
• Mantenha termos técnicos, números e exemplos exatos
• Se não houver informação suficiente, indique claramente
• Não adicione informações externas

RESPOSTA:`.trim();

        return this.sendPrompt(prompt);
    }
}

