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

    public async generateResponse(chunks: Array<{ score: number; text: string }>, search: string): Promise<string> {
        const sorted = chunks
            .sort((a, b) => b.score - a.score)
            .map((c) => `• ${c.text.replace(/\s+/g, " ").trim()}`)
            .join("\n\n");

        const prompt = `
Responda somente com informações presentes nos trechos.
Não copie frases dos trechos.
Use suas próprias palavras.
Se a resposta não estiver nos trechos, responda exatamente:
"Informação não encontrada nos trechos."

Trechos:
${sorted}

Pergunta:
${search}

Resposta:
`.trim();

        return this.sendPrompt(prompt);
    }
}

