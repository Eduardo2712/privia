import { Injectable } from "@nestjs/common";
import { encode, decode } from "gpt-tokenizer";

@Injectable()
export class BaseFileService {
    constructor() {}

    protected smartChunker(opts: {
        text: string;
        maxTokens?: number;
        overlapTokens?: number;
        minBlockTokens?: number;
        semanticMergeThreshold?: number;
    }) {
        let { text, maxTokens = 600, overlapTokens = 150, minBlockTokens = 40 } = opts;

        if (!text.trim()) {
            return [];
        }

        text = text
            .replace(/\r\n/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/^\s*[-*_]{3,}\s*$/gm, "")
            .trim();

        const hasHeaders = /^#{1,6}\s/m.test(text);
        const hasList = /^\s*[-*+]\s/m.test(text) || /^\s*\d+\.\s/m.test(text);
        const isStructured = hasHeaders || hasList;

        let blocks = (isStructured ? text.split(/\n(?=#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s)/gm) : text.split(/\n{2,}/g))
            .map((b) => b.trim())
            .filter(Boolean);

        const merged: string[] = [];

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const tok = encode(b).length;

            if (tok < minBlockTokens) {
                if (i < blocks.length - 1) {
                    blocks[i + 1] = blocks[i + 1] + "\n\n" + b;
                } else if (merged.length > 0) {
                    merged[merged.length - 1] += "\n\n" + b;
                } else {
                    merged.push(b);
                }
            } else {
                merged.push(b);
            }
        }

        let semMerged = [...merged];

        const finalChunks: string[] = [];

        for (const block of semMerged) {
            const tokens = encode(block);

            if (tokens.length <= maxTokens) {
                finalChunks.push(block.trim());

                continue;
            }

            let start = 0;
            const step = Math.max(50, maxTokens - overlapTokens);

            while (start < tokens.length) {
                const end = Math.min(start + maxTokens, tokens.length);
                const slice = decode(tokens.slice(start, end)).trim();

                if (slice) {
                    finalChunks.push(slice);
                }

                start += step;
            }
        }

        const cleaned: string[] = [];

        for (let c of finalChunks) {
            c = c.trim();
            const tok = encode(c).length;

            if (tok < Math.max(20, minBlockTokens / 2) && cleaned.length > 0) {
                cleaned[cleaned.length - 1] += "\n\n" + c;
            } else {
                cleaned.push(c);
            }
        }

        return cleaned;
    }
}

