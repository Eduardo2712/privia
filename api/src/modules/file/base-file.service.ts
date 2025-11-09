import { Injectable } from "@nestjs/common";
import { cleanSentences } from "../../common/utils/functions.util";

@Injectable()
export class BaseFileService {
    constructor() {}

    protected chunkTextSmartRobust(rawText: string, maxLength = 300, overlap = 30): string[] {
        if (!rawText) {
            return [];
        }

        const sentences = cleanSentences(rawText);

        const chunks: string[] = [];
        let currentChunk = "";

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();

            if (!trimmedSentence) {
                continue;
            }

            if (trimmedSentence.length > maxLength) {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }

                const words = trimmedSentence.split(/\s+/);
                let wordChunk = "";

                for (const word of words) {
                    if ((wordChunk + " " + word).length > maxLength && wordChunk) {
                        chunks.push(wordChunk.trim());

                        const overlapWords = wordChunk.split(/\s+/).slice(-Math.ceil(overlap / 10));
                        wordChunk = overlapWords.join(" ") + " " + word;
                    } else {
                        wordChunk += (wordChunk ? " " : "") + word;
                    }
                }

                if (wordChunk.trim()) {
                    chunks.push(wordChunk.trim());
                }

                continue;
            }

            const testChunk = currentChunk + (currentChunk ? " " : "") + trimmedSentence;

            if (testChunk.length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());

                const overlapSentences = currentChunk.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [];
                const overlapText = overlapSentences.slice(-2).join(" ");
                currentChunk = overlapText + " " + trimmedSentence;
            } else {
                currentChunk = testChunk;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter((c) => c && c.trim().length > 20);
    }

    protected rerankResults(results: Array<{ score: number; text: string }>): Array<{ score: number; text: string }> {
        const unique: Array<{ score: number; text: string }> = [];

        for (const result of results) {
            const isDuplicate = unique.some((u) => {
                const similarity = this.calculateTextSimilarity(u.text, result.text);

                return similarity > 0.8;
            });

            if (!isDuplicate) {
                unique.push(result);
            }
        }

        return unique.sort((a, b) => b.score - a.score);
    }

    protected calculateTextSimilarity(text1: string, text2: string): number {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }
}

