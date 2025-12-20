import { Injectable } from "@nestjs/common";
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "@langchain/textsplitters";
import { ChunkOptionsInterface } from "./interfaces/file.interface";

@Injectable()
export class ChunkerFileService {
    public async chunkText(text: string, options: ChunkOptionsInterface = {}): Promise<string[]> {
        const chunkSize = 256;
        const chunkOverlap = 32;

        const cleaned = this.normalizeWhitespace(text);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize * 4,
            chunkOverlap: chunkOverlap * 4,
            separators: ["\n\n", "\n", ".", "!", "?", ";", ",", " ", ""]
        });

        const roughChunks = await splitter.splitText(cleaned);

        const tokenSplitter = new TokenTextSplitter({
            chunkSize,
            chunkOverlap
        });

        const finalChunks: string[] = [];
        for (const chunk of roughChunks) {
            const tokenized = await tokenSplitter.splitText(chunk);
            for (const part of tokenized) {
                const trimmed = part.trim();
                if (trimmed.length > 20) {
                    finalChunks.push(trimmed);
                }
            }
        }

        return this.dedupe(finalChunks);
    }

    private normalizeWhitespace(text: string): string {
        return text
            .replaceAll(/\r\n?/g, "\n")
            .replaceAll(/[\t\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
            .replaceAll(/ {2,}/g, " ")
            .replaceAll(/\n{3,}/g, "\n\n")
            .replaceAll("\n ", "\n")
            .replaceAll(" \n", "\n")
            .trim();
    }

    private dedupe(chunks: string[]): string[] {
        const seen = new Set<string>();
        const out: string[] = [];

        for (const c of chunks) {
            const sig = c.substring(0, 100).toLowerCase().replaceAll(/\s+/g, "");
            if (!seen.has(sig)) {
                seen.add(sig);
                out.push(c);
            }
        }
        return out;
    }

    public expandQuery(query: string): string[] {
        const normalized = this.normalizeQuery(query);
        const terms = normalized.split(/\s+/).filter(Boolean);
        const variants = new Set<string>();

        for (const term of terms) {
            variants.add(term);
            const withoutAccents = term.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");
            if (withoutAccents !== term) {
                variants.add(withoutAccents);
            }
        }

        for (let i = 0; i < terms.length - 1; i++) {
            variants.add(`${terms[i]} ${terms[i + 1]}`);
        }

        return Array.from(variants).filter((v) => v.length >= 2);
    }

    private normalizeQuery(q: string): string {
        return q
            .toLowerCase()
            .replaceAll(/[^\p{L}\p{N}\s]/gu, " ")
            .replaceAll(/\s+/g, " ")
            .trim();
    }

    public rerankHybrid(chunks: Array<{ score: number; text: string }>, query: string): Array<{ score: number; text: string }> {
        const expanded = this.expandQuery(query);
        if (!expanded.length) return chunks;

        const k1 = 1.2;
        const b = 0.75;
        const avgLen = chunks.reduce((s, c) => s + c.text.length, 0) / Math.max(1, chunks.length);

        const idf = new Map<string, number>();
        for (const term of expanded) {
            const df = chunks.filter((c) => c.text.toLowerCase().includes(term)).length;
            idf.set(term, Math.log((chunks.length - df + 0.5) / (df + 0.5) + 1));
        }

        const scored = chunks.map((chunk) => {
            const lower = chunk.text.toLowerCase();
            const docLen = chunk.text.length;
            let bm25 = 0;

            for (const term of expanded) {
                if (!lower.includes(term)) continue;
                const regex = new RegExp(this.escapeRegex(term), "g");
                let tf = 0;
                while (regex.exec(lower) !== null) {
                    tf++;
                }
                const idfScore = idf.get(term) || 0;
                bm25 += (idfScore * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docLen) / avgLen));
            }

            return { ...chunk, score: chunk.score * 0.5 + bm25 * 0.5 };
        });

        return scored.sort((a, b) => b.score - a.score);
    }

    public async rerank(query: string, chunks: Array<{ score: number; text: string }>): Promise<Array<{ score: number; text: string }>> {
        return this.rerankHybrid(chunks, query);
    }

    private escapeRegex(s: string): string {
        return s.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    }

    public topChunks(chunks: Array<{ score: number; text: string }>): Array<{ score: number; text: string }> {
        const seen = new Set<string>();
        const maxLen = 600;

        const compact = chunks
            .map((c) => {
                let t = c.text.trim();
                if (t.length > maxLen) {
                    const trimmed = t.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    t = lastPeriod > maxLen * 0.75 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }
                return { score: c.score, text: t };
            })
            .filter((c) => {
                const sig = c.text.substring(0, 80).toLowerCase().replaceAll(/\s+/g, "");
                if (seen.has(sig)) return false;
                seen.add(sig);
                return true;
            });

        return compact.slice(0, 4);
    }
}

