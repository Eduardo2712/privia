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

    public async generateResponse(prompt: string, search: string): Promise<string> {
        return await this.sendPrompt(
            `Você é um assistente que analisa documentos técnicos.  
            Use SOMENTE as informações dos trechos abaixo para responder à consulta.  
            Não invente nada e não use conhecimento externo.

            Trechos (ordenados por relevância):
            ${prompt}

            Consulta do usuário:
            ${search}

            Instruções:
            1. Responda em português, de forma clara e objetiva.
            2. Baseie-se apenas nos trechos fornecidos.
            3. Se possível, cite o número do trecho onde encontrou a informação (ex: [1]).
            4. Se não houver dados suficientes, diga apenas: "Não há informações suficientes nos trechos fornecidos."

            Resposta:`
        );
    }
}

