import { Injectable } from "@nestjs/common";
import { cleanSentences } from "../../common/utils/functions.util";

@Injectable()
export class BaseFileService {
    constructor() {}

    protected chunkTextSmartRobust(rawText: string, maxLength = 768, overlap = 50): string[] {
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

        return chunks.filter((c) => c && c.trim().length > 50);
    }
}

