import { Injectable } from "@nestjs/common";
import { encode, decode } from "gpt-tokenizer";

@Injectable()
export class BaseFileService {
    constructor() {}

    protected smartChunker(rawText: string, maxTokens = 600, overlapTokens = 150, minBlockTokens = 40): string[] {
        if (typeof rawText !== "string" || rawText.trim().length === 0) {
            return [];
        }

        let text = rawText.replaceAll("\r\n", "\n");
        text = text.replaceAll(/^\s*[-*_]{3,}\s*$/gm, "\n");
        text = text.replaceAll(/\n{3,}/g, "\n\n");

        const hasHeaders = /^#{1,6}\s/m.test(text);
        const hasLists = /^\s*[-*\d+.]\s/m.test(text);
        const isStructured = hasHeaders || hasLists;

        const blocks = (isStructured ? text.split(/\n(?=#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s)/gm) : text.split(/\n{2,}/g))
            .map((b) => (b || "").trim())
            .filter((b) => b.length > 0);

        const mergedBlocks: string[] = [];
        for (let i = 0; i < blocks.length; i++) {
            const blk = blocks[i];
            const tokLen = encode(blk).length;

            if (tokLen < minBlockTokens) {
                if (i + 1 < blocks.length) {
                    blocks[i + 1] = (blocks[i + 1] || "") + "\n\n" + blk;

                    continue;
                } else if (mergedBlocks.length > 0) {
                    mergedBlocks[mergedBlocks.length - 1] += "\n\n" + blk;

                    continue;
                } else {
                    mergedBlocks.push(blk);
                }
            } else {
                mergedBlocks.push(blk);
            }
        }

        const finalChunks: string[] = [];

        for (const block of mergedBlocks) {
            const tokens = encode(block);

            if (tokens.length <= maxTokens) {
                const t = block.trim();

                if (t && !/^[-*_]+$/.test(t)) {
                    finalChunks.push(t);
                }

                continue;
            }

            let start = 0;

            while (start < tokens.length) {
                const end = Math.min(start + maxTokens, tokens.length);
                const slice = tokens.slice(start, end);
                const chunkText = decode(slice).trim();

                if (chunkText && !/^\s*[-*_]+\s*$/.test(chunkText)) {
                    finalChunks.push(chunkText);
                }

                start += Math.max(1, maxTokens - overlapTokens);
            }
        }

        const cleaned: string[] = [];

        for (const c of finalChunks) {
            const tokLen = encode(c).length;

            if (tokLen < Math.max(15, Math.floor(minBlockTokens / 3)) && cleaned.length > 0) {
                cleaned[cleaned.length - 1] = cleaned.at(-1) + "\n\n" + c;
            } else {
                cleaned.push(c);
            }
        }

        return cleaned;
    }
}

