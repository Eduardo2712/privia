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
        const tokens = search
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2);
        const strong = [...tokens].sort((a, b) => b.length - a.length).slice(0, 3);
        const compressed = chunks
            .map((c, i) => {
                const sentences = c.text.split(/(?<=[\.\!?])\s+/).slice(0, 60);
                const withStrong = sentences.filter((s) => strong.some((k) => s.toLowerCase().includes(k)));
                let selected: string[];

                if (withStrong.length > 0) {
                    selected = withStrong.slice(0, 4);
                } else {
                    const scored = sentences.map((s) => {
                        const ls = s.toLowerCase();
                        let score = 0;

                        tokens.forEach((k) => {
                            if (ls.includes(k)) {
                                score += 1;
                            }
                        });

                        return { s, score };
                    });

                    scored.sort((a, b) => b.score - a.score || a.s.length - b.s.length);
                    selected = scored.slice(0, 3).map((x) => x.s);
                }

                const base = selected.join(" ") || sentences.slice(0, 2).join(" ");
                const trimmed = base.length > 600 ? base.slice(0, 600) : base;

                return `[${i + 1}] ${trimmed}`;
            })
            .join("\n\n");

        const prompt = `Responda exclusivamente com base nos trechos fornecidos.

⚠️ Regras obrigatórias (não as ignore):
- NÃO use qualquer conhecimento externo.
- NÃO faça inferências, deduções, suposições, interpretações subjetivas ou leituras implícitas.
- Só é permitido afirmar algo se existir evidência textual explícita.
- Se a resposta exigir conectar informações que não estão explicitamente ligadas → considere como “sem evidência”.
- Se houver qualquer dúvida → responda “Nenhuma evidência nos trechos fornecidos.”

Processo antes de responder:
1. Leia todos os trechos.
2. Verifique se existe trecho que afirma direta e literalmente a resposta.
3. Se existir, responda citando exatamente o trecho que comprova.
4. Se NÃO existir, responda exatamente:

"Nenhuma evidência nos trechos fornecidos."

Trechos:
${compressed}

Pergunta:
${search}`;

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

