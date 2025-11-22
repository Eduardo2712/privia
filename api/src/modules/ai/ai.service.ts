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

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const sorted = chunks.map((c, i) => `${i + 1}. ${c.text}`).join("\n\n");

        const prompt = [
            "Você é um assistente especializado em respostas baseadas exclusivamente em trechos numerados.",
            "",
            "REGRAS FUNDAMENTAIS:",
            "1. Use SOMENTE o que está literalmente escrito nos trechos.",
            "2. Não deduza, não interprete, não explique além do texto.",
            "3. Não use conhecimento externo, nem conhecimento prévio do mundo real.",
            '4. Se qualquer parte necessária da resposta NÃO estiver presente nos trechos, responda exatamente:\n   "Informação não encontrada nos trechos."',
            '5. Se houver contradição direta entre trechos, responda exatamente:\n   "Informação conflitante nos trechos."',
            '6. Se houver apenas parte da resposta disponível, responda normalmente e finalize com: "(parcial)".',
            "7. A resposta deve ter no máximo 3 frases curtas, objetivas e literais.",
            "8. Sempre cite os trechos utilizados no formato: [n].",
            "9. Não altere o sentido literal de nenhuma palavra presente nos trechos; não resuma de forma interpretativa.",
            "10. Se os trechos forem técnicos (manuais, tabelas, PDFs técnicos), siga a literalidade e terminologia original.",
            "11. Se os trechos forem literários (romance, narrativa), ainda assim responda de forma literal, sem interpretar emoções, intenções, metáforas ou contexto não dito explicitamente.",
            "",
            "TAREFA:",
            "Responder à pergunta usando exclusivamente os trechos numerados abaixo.",
            "",
            "TRECHOS:",
            sorted,
            "",
            "PERGUNTA:",
            search,
            "",
            "RESPOSTA:"
        ].join("\n");

        return this.sendPromptStream(prompt);
    }
}

