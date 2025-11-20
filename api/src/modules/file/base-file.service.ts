import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { get_encoding, Tiktoken } from "tiktoken";
import { SmartChunkerOptsInterface } from "./interfaces/file.interface";
import { sanitize, similarity } from "../../common/utils/functions.util";

@Injectable()
export class BaseFileService implements OnModuleDestroy {
    private encoding: Tiktoken | null = null;

    constructor() {}

    private getEncoding(): Tiktoken {
        if (!this.encoding) {
            this.encoding = get_encoding("cl100k_base");
        }
        return this.encoding;
    }

    onModuleDestroy() {
        if (this.encoding) {
            this.encoding.free();
            this.encoding = null;
        }
    }

    protected smartChunker(opts: SmartChunkerOptsInterface): string[] {
        const encoding = this.getEncoding();

        let {
            text,
            maxTokens = 300,
            overlapTokens = 75,
            minBlockTokens = 40,
            semanticMergeThreshold,
            tokenizer = (t) => Array.from(encoding.encode(t)),
            detokenizer = (t) => {
                const decoded = encoding.decode(new Uint32Array(t));

                return typeof decoded === "string" ? decoded : new TextDecoder().decode(decoded);
            }
        } = opts;

        if (!text.trim()) {
            return [];
        }

        text = sanitize(text);

        const hasHeaders = /^#{1,6}\s/m.test(text);
        const hasList = /^\s*[-*+]\s/m.test(text) || /^\s*\d+\.\s/m.test(text);
        const isStructured = hasHeaders || hasList;

        let blocks = (isStructured ? text.split(/\n(?=#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s)/gm) : text.split(/\n{2,}/g))
            .map((b) => b.trim())
            .filter(Boolean);

        const merged: string[] = [];

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const tokCount = tokenizer(b).length;

            if (tokCount < minBlockTokens) {
                if (i < blocks.length - 1) {
                    blocks[i + 1] = b + "\n\n" + blocks[i + 1];
                } else if (merged.length > 0) {
                    merged[merged.length - 1] += "\n\n" + b;
                } else {
                    merged.push(b);
                }
            } else {
                merged.push(b);
            }
        }

        const finalChunks: string[] = [];

        for (const block of merged) {
            const tokens = tokenizer(block);

            if (tokens.length <= maxTokens) {
                finalChunks.push(block.trim());
                continue;
            }

            let cursor = 0;
            const overlap = Math.min(overlapTokens, Math.floor(maxTokens / 2));

            while (cursor < tokens.length) {
                const remaining = tokens.length - cursor;

                let windowSize = Math.min(maxTokens, remaining);
                let windowTokens = tokens.slice(cursor, cursor + windowSize);
                let windowText = detokenizer(windowTokens).trim();

                const boundaryRegex = /[\.!?…](?=\s|$)/g;

                let match: RegExpExecArray | null;
                let lastBoundaryIndex = -1;

                while ((match = boundaryRegex.exec(windowText)) !== null) {
                    lastBoundaryIndex = match.index + match[0].length;
                }

                if (lastBoundaryIndex > 0 && lastBoundaryIndex >= Math.floor(windowText.length * 0.55)) {
                    const trimmed = windowText.slice(0, lastBoundaryIndex).trim();
                    const trimmedTokens = tokenizer(trimmed);

                    if (trimmedTokens.length > Math.max(80, minBlockTokens)) {
                        windowTokens = trimmedTokens;
                        windowText = trimmed;
                    }
                }

                if (windowText) {
                    finalChunks.push(windowText);
                }

                if (cursor + windowTokens.length >= tokens.length) {
                    break;
                }

                cursor += Math.max(1, windowTokens.length - overlap);
            }
        }

        const cleaned: string[] = [];

        for (let c of finalChunks) {
            c = c.trim();

            const tokCount = tokenizer(c).length;

            if (tokCount < Math.max(20, minBlockTokens / 2) && cleaned.length > 0) {
                cleaned[cleaned.length - 1] += "\n\n" + c;
            } else {
                cleaned.push(c);
            }
        }

        if (semanticMergeThreshold != null && cleaned.length > 1) {
            similarity(semanticMergeThreshold, tokenizer, cleaned);
        }

        return cleaned;
    }
}

