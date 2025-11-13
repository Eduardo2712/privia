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
        const context = chunks.map((c, i) => `Contexto ${i + 1}:\n${c.text}`).join("\n\n---\n\n");

        const prompt = `Você é um assistente de pesquisa que analisa documentos e fornece respostas precisas.

            Trechos dos documentos:
            ${context}

            Pergunta: ${search}

            Instruções para sua resposta:
            - Forneça uma resposta completa e bem estruturada
            - Inclua todos os detalhes relevantes encontrados nos trechos
            - Se houver múltiplos aspectos, liste-os de forma organizada
            - Se houver exemplos, fórmulas ou processos importantes, inclua-os na resposta
            - Não invente informações ou detalhes
            - Use somente informações presentes nos trechos fornecidos
            - Cite trechos dos documentos referenciando-os
            - Seja direto, sem saudações ou comentários extra
            Resposta detalhada:`.trim();

        return this.sendPrompt(prompt);
    }
}

