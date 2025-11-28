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
        const compressed = chunks
            .map((c, i) => {
                const sentences = c.text.split(/(?<=[.!?])\s+/).filter(Boolean);

                const prefix = sentences.slice(0, 2);

                const tokens = search
                    .toLowerCase()
                    .split(/\s+/)
                    .filter((w) => w.length > 2);

                const scored = sentences.slice(2).map((s) => {
                    const ls = s.toLowerCase();

                    let score = 0;

                    tokens.forEach((t) => {
                        if (ls.includes(t)) score += 2;
                        if (ls.startsWith(t)) score += 1;
                    });

                    score += Math.min(s.length / 80, 2);

                    return { s, score };
                });

                scored.sort((a, b) => b.score - a.score);

                const selected = scored.map((x) => x.s).slice(0, 4);

                const merged = [...prefix, ...selected].join(" ");

                const trimmed = merged.length > 1200 ? merged.slice(0, 1200) : merged;

                return `[${i + 1}] ${trimmed}`;
            })
            .join("\n\n");

        const prompt = `IMPORTANTE:
Você deve responder exclusivamente com base nos trechos fornecidos abaixo.
Não use conhecimento externo.
Não faça inferências que não estejam explicitamente presentes no texto.
Se não houver evidência textual clara para responder, diga apenas:

"Nenhuma evidência nos trechos fornecidos."

Regras:
- Se citar algo, cite apenas usando o número do trecho (ex: [3]).
- Não invente informações implícitas.
- Não complete lacunas com conhecimento externo.
- Se houver informação parcial, responda apenas com o que os trechos permitem.

Trechos relevantes:
${compressed}

Pergunta:
${search}

Agora responda seguindo as regras.
`;

        return this.sendPromptStream(prompt);
    }

    public async generateSummary(text: string): Promise<string> {
        const limit = 6000;

        const clean = text.replace(/\s+/g, " ").trim();

        const chunk = clean.length > limit * 2 ? clean.slice(0, limit) + " " + clean.slice(-limit) : clean;

        const prompt = `
            Resuma o texto abaixo sem adicionar informações, mantendo apenas as ideias principais.

            Texto a ser resumido:
            """
            ${chunk}
            """

            Agora produza o resumo:
        `;

        return this.sendPrompt(prompt, 300);
    }
}

