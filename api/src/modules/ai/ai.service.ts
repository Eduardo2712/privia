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

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const K = Math.min(7, chunks.length);

        const unique = Array.from(new Map(chunks.sort((a, b) => b.score - a.score).map((c) => [c.text.trim(), c])).values()).slice(0, K);

        const sorted = unique.map((c, i) => `${i + 1}. ${sanitize(c.text)}`).join("\n");

        const prompt = [
            "Responda em português usando SÓ os trechos numerados.",
            '- Se não houver resposta nos trechos, responda exatamente: "Informação não encontrada nos trechos."',
            "- Seja objetivo (1–3 frases).",
            "- Não invente nem use fontes externas.",
            '- Se a informação estiver incompleta, marque como "parcial".',
            '- Se houver contradição, responda: "informação conflitante nos trechos".',
            "- Cite fontes como [n] correspondentes aos trechos usados.",
            "Trechos:",
            sorted,
            "Pergunta:",
            search,
            "Resposta:"
        ].join("\n");

        return this.sendPromptStream(prompt);
    }
}

