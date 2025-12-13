import { Injectable } from "@nestjs/common";
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "@langchain/textsplitters";
import { ChunkOptionsInterface } from "./interfaces/file.interface";

@Injectable()
export class ChunkerFileService {
    public async chunkText(text: string, options: ChunkOptionsInterface = {}): Promise<string[]> {
        const {
            chunkSizeTokens = 180,
            chunkOverlapTokens = 30,
            separators = ["\n\n", "\n", ".", " ", ""],
            semantic = true,
            strategy = "fine"
        } = options;

        const cleaned = this.normalizeWhitespace(text);

        const initialSegments = semantic ? this.semanticPreSplit(cleaned) : [cleaned];

        const targetSize = strategy === "coarse" ? Math.max(1600, chunkSizeTokens) : chunkSizeTokens;
        const targetOverlap = strategy === "coarse" ? Math.max(160, chunkOverlapTokens) : chunkOverlapTokens;
        const tokenSplitter = new TokenTextSplitter({ chunkSize: targetSize, chunkOverlap: targetOverlap });
        const finalChunks: string[] = [];

        for (const segment of initialSegments) {
            if (segment.split(/\s+/).length <= chunkSizeTokens + chunkOverlapTokens) {
                finalChunks.push(segment.trim());
                continue;
            }

            const recursive = new RecursiveCharacterTextSplitter({
                chunkSize: (strategy === "coarse" ? targetSize : chunkSizeTokens) * 4,
                chunkOverlap: (strategy === "coarse" ? targetOverlap : chunkOverlapTokens) * 4,
                separators
            });

            const rough = await recursive.splitText(segment);

            for (const piece of rough) {
                const tokenized = strategy === "chapter" && piece.split(/\s+/).length <= 4500 ? [piece] : await tokenSplitter.splitText(piece);

                for (const tk of tokenized) {
                    const trimmed = tk.trim();

                    if (trimmed) {
                        finalChunks.push(trimmed);
                    }
                }
            }
        }

        return this.dedupe(finalChunks);
    }

    private normalizeWhitespace(text: string): string {
        return text
            .replaceAll("\r", "")
            .replaceAll(/\t+/g, " ")
            .replaceAll(/ +/g, " ")
            .replaceAll(/\n{3,}/g, "\n\n")
            .trim();
    }

    private semanticPreSplit(text: string): string[] {
        const sections = text
            .split(/\n(?=#+\s)|\n{2,}(?=\S)/g)
            .flatMap((s) => s.split(/(?<=\.)\n\n+/g))
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        return sections.length ? sections : [text];
    }

    private dedupe(chunks: string[]): string[] {
        const seen = new Set<string>();
        const out: string[] = [];

        for (const c of chunks) {
            const sig = c.substring(0, 160).toLowerCase().replaceAll(/\s+/g, " ");

            if (!seen.has(sig)) {
                seen.add(sig);

                out.push(c);
            }
        }
        return out;
    }

    public expandQuery(query: string): string[] {
        const base = this.normalizeQuery(query);
        const variants = new Set<string>();

        for (const term of base.split(/\s+/)) {
            if (!term) {
                continue;
            }

            variants.add(term);
            variants.add(term.normalize("NFD").replaceAll(/\p{Diacritic}/gu, ""));

            if (term.endsWith("s")) {
                variants.add(term.slice(0, -1));
            }

            if (term.length > 4) {
                variants.add(term.slice(0, 4));
            }
        }

        const parts = base.split(/\s+/).filter(Boolean);

        for (let i = 0; i < parts.length - 1; i++) {
            variants.add(parts[i] + " " + parts[i + 1]);
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

        if (!expanded.length) {
            return chunks;
        }

        const docCount = chunks.length;
        const avgLen = chunks.reduce((s, c) => s + c.text.length, 0) / Math.max(1, docCount);

        const idf = new Map<string, number>();

        for (const term of expanded) {
            const df = chunks.reduce((acc, c) => (c.text.toLowerCase().includes(term) ? acc + 1 : acc), 0);

            idf.set(term, Math.log(1 + (docCount - df + 0.5) / (df + 0.5)));
        }

        const k1 = 1.4;
        const b = 0.72;

        const scored = chunks.map((chunk, idx) => {
            const lower = chunk.text.toLowerCase();
            const docLen = chunk.text.length;
            let bm25 = 0;
            let termMatches = 0;

            for (const term of expanded) {
                const regex = new RegExp(String.raw`\b${this.escapeRegex(term)}\b`, "g");
                const occurrences: string[] = [];
                let match: RegExpExecArray | null = null;

                while ((match = regex.exec(lower)) !== null) {
                    occurrences.push(match[0]);
                }

                if (!occurrences.length) {
                    continue;
                }

                termMatches++;
                const tf = occurrences.length;
                const idfScore = idf.get(term) || 0;
                bm25 += idfScore * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docLen) / avgLen)));
            }

            let proximityBonus = 0;
            const maxProximityChecks = Math.min(3, expanded.length - 1);

            for (let i = 0; i < maxProximityChecks; i++) {
                const bigram = `${expanded[i]} ${expanded[i + 1]}`;

                if (lower.includes(bigram)) {
                    proximityBonus += 0.15;
                }
            }
            const coverage = termMatches / Math.max(1, expanded.length);
            const coverageBonus = coverage * 0.35;
            const combined = chunk.score * 0.4 + bm25 * 0.45 + (proximityBonus + coverageBonus) * 0.15;

            return { ...chunk, score: combined, originalIndex: idx };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored;
    }

    public async rerank(query: string, chunks: Array<{ score: number; text: string }>): Promise<Array<{ score: number; text: string }>> {
        const provider = process.env.RERANK_PROVIDER?.toLowerCase();

        if (!provider) {
            return this.rerankHybrid(chunks, query);
        }

        try {
            return this.rerankHybrid(chunks, query);
        } catch {
            return this.rerankHybrid(chunks, query);
        }
    }

    private escapeRegex(s: string): string {
        return s.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    }
}

