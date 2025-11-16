import { Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { sanitize } from "../../common/utils/functions.util";

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
            .map((c, i) => `${i + 1}. ${sanitize(c.text)}`)
            .join("\n\n");

        const prompt = `
           Responda somente com base nos trechos fornecidos.

Regras:
- Não invente nada que não esteja nos trechos.
- Use apenas suas palavras (não copie frases).
- Se a informação existir mesmo que parcialmente, use.
- Se NÃO existir em nenhum trecho, responda exatamente:
  "Informação não encontrada nos trechos."

            Trechos:
            ${sorted}

            Pergunta:
            ${search}

            Responda de forma curta, direta e objetiva:`.trim();

        console.log("Prompt para IA:", prompt);

        return this.sendPrompt(prompt);
    }
}

