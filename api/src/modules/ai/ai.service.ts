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
                            if (ls.includes(k)) score += 1;
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

        const prompt = `Contexto:\n${compressed}\n\nPergunta: ${search}\n\nInstruções:\n- Responda de forma direta e completa usando APENAS o contexto\n- Se houver qualquer menção ao termo consultado, responda objetivamente onde e para qual finalidade\n- Nunca responda "não encontrado" quando houver ao menos uma menção no contexto\n- Cite as fontes relevantes usando [n]\n\nResposta:`;

        return this.sendPromptStream(prompt);
    }
}

