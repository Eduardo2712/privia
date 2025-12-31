import { Injectable } from "@nestjs/common";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChunkOptionsInterface } from "./interfaces/file.interface";

@Injectable()
export class ChunkerFileService {
    private readonly CHUNK_SIZE = 800;
    private readonly CHUNK_OVERLAP = 150;
    private readonly MIN_CHUNK_SIZE = 50;
    private readonly DEDUP_PREFIX_LEN = 100;

    public async chunkText(text: string, options: ChunkOptionsInterface = {}): Promise<string[]> {
        const cleaned = this.normalizeText(text);
        if (!cleaned?.length) return [];

        const isLiterature = this.detectLiterature(cleaned);
        const chunkSize = options.chunkSizeTokens ?? (isLiterature ? 1000 : this.CHUNK_SIZE);
        const overlap = options.chunkOverlapTokens ?? (isLiterature ? 200 : this.CHUNK_OVERLAP);

        const separators = isLiterature
            ? ["\n\n\n", "\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "]
            : ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "];

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize,
            chunkOverlap: overlap,
            separators
        });

        const chunks = await splitter.splitText(cleaned);
        return this.dedupe(chunks.map((c) => c.trim()).filter((c) => c.length >= this.MIN_CHUNK_SIZE));
    }

    private detectLiterature(text: string): boolean {
        const dialoguePattern = /[""].*?[""]|—.*?—|\bdisse\b|\bfalou\b|\bperguntou\b/gi;
        const paragraphBreaks = (text.match(/\n\n/g) || []).length;
        const avgParagraphLen = text.length / Math.max(1, paragraphBreaks);
        const dialogueMatches = (text.match(dialoguePattern) || []).length;
        return dialogueMatches > 5 || avgParagraphLen > 400;
    }

    private normalizeText(text: string): string {
        return text
            .replace(/\r\n/g, "\n")
            .replace(/[\t\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
            .replace(/ {2,}/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/\n /g, "\n")
            .replace(/ \n/g, "\n")
            .trim();
    }

    private dedupe(chunks: string[]): string[] {
        const seen = new Set<string>();
        const result: string[] = [];

        for (const chunk of chunks) {
            const sig = chunk.substring(0, this.DEDUP_PREFIX_LEN).toLowerCase().replace(/\s+/g, "");
            if (!seen.has(sig)) {
                seen.add(sig);
                result.push(chunk);
            }
        }
        return result;
    }

    public expandQuery(query: string): string[] {
        const normalized = this.normalizeQuery(query);
        const terms = normalized.split(/\s+/).filter(Boolean);
        const variants = new Set<string>();

        for (const term of terms) {
            variants.add(term);
            const clean = term.normalize("NFD").replace(/\p{Diacritic}/gu, "");
            if (clean !== term) variants.add(clean);
        }

        for (let i = 0; i < terms.length - 1; i++) {
            variants.add(`${terms[i]} ${terms[i + 1]}`);
        }

        return Array.from(variants).filter((v) => v.length >= 2);
    }

    private normalizeQuery(q: string): string {
        return q
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
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
                const regex = new RegExp(this.escapeRegex(term), "gi");
                let tf = 0;
                let match;
                while ((match = regex.exec(lower)) !== null) tf++;
                const idfScore = idf.get(term) || 0;
                bm25 += (idfScore * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docLen) / avgLen));
            }

            return { ...chunk, score: chunk.score * 0.6 + bm25 * 0.4 };
        });

        return scored.sort((a, b) => b.score - a.score);
    }

    private escapeRegex(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    }

    public topChunks(chunks: Array<{ score: number; text: string }>, limit = 6): Array<{ score: number; text: string }> {
        const seen = new Set<string>();
        const maxLen = 900;

        return chunks
            .map((c) => {
                let t = c.text.trim();
                if (t.length > maxLen) {
                    const trimmed = t.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    t = lastPeriod > maxLen * 0.7 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }
                return { score: c.score, text: t };
            })
            .filter((c) => {
                const sig = c.text.substring(0, 100).toLowerCase().replace(/\s+/g, "");
                if (seen.has(sig)) return false;
                seen.add(sig);
                return true;
            })
            .slice(0, limit);
    }
}

