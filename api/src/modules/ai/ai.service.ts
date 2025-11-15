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
        const sortedChunks = [...chunks].sort((a, b) => b.score - a.score);

        const prompt = `Use apenas as informações dos TRECHOS abaixo para responder a PERGUNTA.

        Se a resposta não estiver nos trechos, diga: "Informação não encontrada nos trechos."

        TRECHOS:        
        ${sortedChunks}

        PERGUNTA:
        ${search}

        RESPOSTA:`.trim();

        return this.sendPrompt(prompt);
    }
}

