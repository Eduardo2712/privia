import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { get_encoding, Tiktoken } from "tiktoken";
import { DocumentAnalysisInterface, SmartChunkerOptionsInterface } from "./interfaces/chunker-file.interface";
import { DocumentType } from "./enums/file.enum";

@Injectable()
export class ChunkerFileService implements OnModuleDestroy {
    private encoding: Tiktoken | null = null;

    private getEncoding(): Tiktoken {
        if (!this.encoding) {
            this.encoding = get_encoding("cl100k_base");
        }

        return this.encoding;
    }

    onModuleDestroy() {
        if (this.encoding) {
            try {
                this.encoding.free();
            } catch (e) {}

            this.encoding = null;
        }
    }

    public chunkText(opts: SmartChunkerOptionsInterface): string[] {
        const encoding = this.getEncoding();

        let {
            text,
            maxTokens = 512,
            overlapTokens = 128,
            minBlockTokens = 50,
            semanticMergeThreshold = 0.65,
            tokenizer = (t) => Array.from(encoding.encode(t)),
            detokenizer = (t) => {
                const arr = t instanceof Uint32Array ? t : new Uint32Array(t);

                const dec = encoding.decode(arr);

                return typeof dec === "string" ? dec : String(dec);
            }
        } = opts;

        if (!text || !text.trim()) {
            return [];
        }

        text = this.sanitize(text);
        text = this.removeRepeatingLines(text);

        const analysis = this.analyzeDocument(text);

        let blocks = this.splitByDocumentType(text, analysis);

        blocks = this.preserveContext(blocks, analysis);

        blocks = this.mergeSmallBlocks(blocks, tokenizer, minBlockTokens);

        const finalChunks: string[] = [];

        for (const block of blocks) {
            const tokens = tokenizer(block);

            if (tokens.length <= maxTokens) {
                finalChunks.push(block.trim());

                continue;
            }

            const overlap = this.calculateAdaptiveOverlap(analysis, overlapTokens, maxTokens);

            let cursor = 0;

            while (cursor < tokens.length) {
                const window = tokens.slice(cursor, cursor + maxTokens);
                let windowText = detokenizer(window).trim();

                const cut = this.smartBoundaryCut(windowText, analysis);
                const chunkText = cut.trim();

                const chosen = chunkText.length > 0 ? chunkText : windowText;

                finalChunks.push(chosen);

                const advanceTokens = tokenizer(chosen).length || Math.max(1, window.length);

                if (cursor + advanceTokens >= tokens.length) {
                    break;
                }

                cursor += Math.max(1, advanceTokens - overlap);
            }
        }

        const cleaned = this.finalClean(finalChunks, tokenizer, minBlockTokens);

        let merged = cleaned;

        if (semanticMergeThreshold != null && semanticMergeThreshold > 0) {
            merged = this.semanticMergeJaccard(cleaned, semanticMergeThreshold, tokenizer);
        }

        return this.postProcess(merged, analysis);
    }

    private analyzeDocument(text: string): DocumentAnalysisInterface {
        const sample = text.slice(0, Math.min(10000, text.length));
        const lines = text.split("\n");

        const hasCode = this.detectCode(sample);
        const hasMarkdown = this.detectMarkdown(sample);
        const hasTables = this.detectTabular(sample);
        const hasLists = this.detectLists(sample);
        const hasHeadings = this.detectHeadings(sample);

        const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(1, lines.length);
        const structureScore = this.calculateStructureScore(text);

        let type = DocumentType.PROSE;

        if (hasCode && !hasMarkdown) {
            type = DocumentType.CODE;
        } else if (hasMarkdown || (hasHeadings && hasLists)) {
            type = DocumentType.MARKDOWN;
        } else if (hasTables) {
            type = DocumentType.TABULAR;
        } else if (this.detectStructure(sample)) {
            type = DocumentType.STRUCTURED;
        } else if (this.detectTechnicalContent(sample)) {
            type = DocumentType.TECHNICAL;
        } else if (hasCode || hasMarkdown || hasTables) {
            type = DocumentType.MIXED;
        }

        const language = this.detectLanguage(sample);

        const structure: "high" | "medium" | "low" = structureScore > 0.7 ? "high" : structureScore > 0.4 ? "medium" : "low";

        return {
            type,
            hasCode,
            hasMarkdown,
            hasTables,
            hasLists,
            hasHeadings,
            language,
            avgLineLength,
            structure
        };
    }

    private detectCode(text: string): boolean {
        const codePatterns = [
            /```[\s\S]*?```/g,
            /`[^`]+`/g,
            /^\s*(function|class|const|let|var|def|public|private|import|from|export)\s/gm,
            /[{};]\s*$/gm,
            /^\s*(if|for|while|switch|return)\s*\(/gm,
            /=>|->|::|<-/g,
            /^\s*\/\/|^\s*\/\*|^\s*#(?!#)/gm
        ];

        let matches = 0;

        for (const pattern of codePatterns) {
            matches += (text.match(pattern) || []).length;
        }

        return matches > 5;
    }

    private detectMarkdown(text: string): boolean {
        const mdPatterns = [/^#{1,6}\s/gm, /\*\*[^*]+\*\*/g, /\*[^*]+\*/g, /\[[^\]]+\]\([^)]+\)/g, /^[-*+]\s/gm, /^>\s/gm, /```/g, /^##?\s*RN\d+/gm];

        let matches = 0;

        for (const pattern of mdPatterns) {
            matches += (text.match(pattern) || []).length;
        }

        return matches > 3;
    }

    private detectLists(text: string): boolean {
        const listPatterns = [/^\s*[-*+•]\s/gm, /^\s*\d+[.)]\s/gm, /^\s*[a-z][.)]\s/gm, /^\s*[ivxIVX]+[.)]\s/gm];

        let matches = 0;

        for (const pattern of listPatterns) {
            matches += (text.match(pattern) || []).length;
        }

        return matches > 3;
    }

    private detectHeadings(text: string): boolean {
        const headingPatterns = [
            /^#{1,6}\s/gm,
            /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝ][A-ZÀ-Ÿ\s]{3,}$/gm,
            /^.+\n[=-]{3,}$/gm,
            /^(chapter|capítulo|section|seção|part|parte)\s+\d+/gim
        ];

        let matches = 0;

        for (const pattern of headingPatterns) {
            matches += (text.match(pattern) || []).length;
        }

        return matches > 2;
    }

    private detectTechnicalContent(text: string): boolean {
        const technicalTerms = [
            /\b(algorithm|theorem|lemma|proof|equation|formula|hypothesis|methodology)\b/gi,
            /\b(função|algoritmo|teorema|equação|fórmula|hipótese|metodologia)\b/gi,
            /[∀∃∈∉⊂⊃∪∩∫∑∏√±≤≥≠≈∞]/g,
            /\$.*?\$/g,
            /\$\$[\s\S]*?\$\$/g
        ];

        let matches = 0;

        for (const pattern of technicalTerms) {
            matches += (text.match(pattern) || []).length;
        }

        return matches > 5;
    }

    private calculateStructureScore(text: string): number {
        const lines = text.split("\n");
        const totalLines = lines.length;

        if (totalLines < 5) {
            return 0;
        }

        let score = 0;

        const emptyLines = lines.filter((l) => !l.trim()).length;
        const emptyRatio = emptyLines / totalLines;

        if (emptyRatio > 0.1 && emptyRatio < 0.4) {
            score += 0.2;
        }

        const structuralMarkers = [/^#{1,6}\s/gm, /^\s*[-*+]\s/gm, /^\s*\d+[.)]\s/gm, /^(chapter|section|part|capítulo|seção|parte)/gim];

        for (const pattern of structuralMarkers) {
            const matches = (text.match(pattern) || []).length;

            if (matches > 0) {
                score += Math.min(0.2, matches * 0.02);
            }
        }

        const lengths = lines.map((l) => l.length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < avg * 0.5) {
            score += 0.2;
        }

        return Math.min(1, score);
    }

    private detectLanguage(text: string): string {
        const sample = text.slice(0, 1000).toLowerCase();

        const ptWords = ["que", "não", "uma", "para", "com", "por", "são", "dos", "mais", "como", "este", "foi"];
        const ptCount = ptWords.reduce((count, word) => count + (sample.match(new RegExp(`\\b${word}\\b`, "g")) || []).length, 0);

        const enWords = ["the", "and", "for", "are", "but", "not", "with", "from", "this", "that", "have", "was"];
        const enCount = enWords.reduce((count, word) => count + (sample.match(new RegExp(`\\b${word}\\b`, "g")) || []).length, 0);

        const ptChars = (sample.match(/[àáâãçéêíóôõú]/g) || []).length;

        if (ptCount > enCount || ptChars > 2) {
            return "pt";
        }
        if (enCount > ptCount) {
            return "en";
        }

        return "unknown";
    }

    private splitByDocumentType(text: string, analysis: DocumentAnalysisInterface): string[] {
        switch (analysis.type) {
            case DocumentType.CODE:
                return this.splitCode(text);

            case DocumentType.MARKDOWN:
                return this.splitMarkdown(text);

            case DocumentType.TABULAR:
                return this.splitTabular(text);

            case DocumentType.STRUCTURED:
                return this.splitStructured(text);

            case DocumentType.TECHNICAL:
                return this.splitTechnical(text);

            case DocumentType.MIXED:
                return this.splitMixed(text, analysis);

            case DocumentType.PROSE:
            default:
                return this.splitProse(text);
        }
    }

    private splitCode(text: string): string[] {
        const blocks: string[] = [];
        const functionPattern =
            /^(\s*(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var|def|public|private)\s+\w+[\s\S]*?(?=^\s*(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var|def|public|private)|$))/gm;

        let match: RegExpExecArray | null;
        let lastIndex = 0;
        const regex = new RegExp(functionPattern);

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                const between = text.slice(lastIndex, match.index).trim();
                if (between) {
                    blocks.push(between);
                }
            }
            blocks.push(match[0].trim());
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            const remaining = text.slice(lastIndex).trim();
            if (remaining) {
                blocks.push(remaining);
            }
        }

        return blocks.length > 0 ? blocks : text.split(/\n{2,}/).filter(Boolean);
    }

    private splitMarkdown(text: string): string[] {
        const blocks: string[] = [];
        const lines = text.split("\n");
        let currentBlock: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (/^#{1,2}\s/.test(line) || /^[A-Z][A-Z\s]{3,}$/.test(line)) {
                if (currentBlock.length > 0) {
                    const blockText = currentBlock.join("\n").trim();
                    if (blockText.length > 0) {
                        blocks.push(blockText);
                    }
                    currentBlock = [];
                }
            }

            currentBlock.push(line);
        }

        if (currentBlock.length > 0) {
            const blockText = currentBlock.join("\n").trim();
            if (blockText.length > 0) {
                blocks.push(blockText);
            }
        }

        return blocks.filter(Boolean);
    }

    private splitTabular(text: string): string[] {
        const lines = text.split("\n");
        const blocks: string[] = [];
        let currentTable: string[] = [];

        for (const line of lines) {
            const isTableRow = /[|\t]/.test(line) || /\s{3,}/.test(line);

            if (isTableRow) {
                currentTable.push(line);
            } else {
                if (currentTable.length > 0) {
                    blocks.push(currentTable.join("\n").trim());
                    currentTable = [];
                }

                if (line.trim()) {
                    blocks.push(line.trim());
                }
            }
        }

        if (currentTable.length > 0) {
            blocks.push(currentTable.join("\n").trim());
        }

        return blocks.filter(Boolean);
    }

    private splitStructured(text: string): string[] {
        return text
            .split(/\n(?=(#{1,2}\s+RN\d+|#{1,2}\s+\*\*RN\d+|^---$))/gim)
            .map((b) => b.trim())
            .filter(Boolean);
    }

    private splitTechnical(text: string): string[] {
        const blocks: string[] = [];

        const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/);

        for (const part of parts) {
            if (part.startsWith("$")) {
                blocks.push(part.trim());
            } else {
                const subBlocks = part.split(/\n{2,}/).filter(Boolean);

                blocks.push(...subBlocks);
            }
        }

        return blocks.filter(Boolean);
    }

    private splitMixed(text: string, analysis: DocumentAnalysisInterface): string[] {
        if (analysis.structure === "high") {
            return this.splitStructured(text);
        } else {
            return this.splitProse(text);
        }
    }

    private splitProse(text: string): string[] {
        return text
            .split(/\n{2,}/)
            .map((b) => b.trim())
            .filter(Boolean);
    }

    private preserveContext(blocks: string[], analysis: DocumentAnalysisInterface): string[] {
        if (blocks.length <= 1) {
            return blocks;
        }

        const result: string[] = [];

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            if (i > 0 && (analysis.hasCode || analysis.hasTables)) {
                const prev = blocks[i - 1];

                if (prev.length < 100 && (/^#|^\/\/|\/\*|^<!--/.test(prev) || /^[A-Z][^.!?]*$/.test(prev))) {
                    if (!result[result.length - 1]?.includes(prev)) {
                        block = prev + "\n\n" + block;
                    }
                }
            }

            result.push(block);
        }

        return result;
    }

    private calculateAdaptiveOverlap(analysis: DocumentAnalysisInterface, defaultOverlap: number, maxTokens: number): number {
        let overlap = defaultOverlap;

        if (analysis.hasCode || analysis.hasTables) {
            overlap = Math.floor(maxTokens * 0.3);
        } else if (analysis.type === DocumentType.PROSE) {
            overlap = Math.floor(maxTokens * 0.2);
        } else if (analysis.type === DocumentType.TECHNICAL) {
            overlap = Math.floor(maxTokens * 0.25);
        } else if (analysis.type === DocumentType.STRUCTURED || analysis.type === DocumentType.MARKDOWN) {
            overlap = Math.floor(maxTokens * 0.25);
        }

        return Math.min(overlap, Math.floor(maxTokens / 2));
    }

    private smartBoundaryCut(text: string, analysis: DocumentAnalysisInterface): string {
        if (text.length < 100) {
            return text;
        }

        if (analysis.hasCode) {
            return this.cutAtCodeBoundary(text);
        }

        if (analysis.hasTables) {
            return this.cutAtTableBoundary(text);
        }

        if (analysis.hasMarkdown || analysis.structure === "high") {
            const structuralCut = this.cutAtStructuralBoundary(text);

            if (structuralCut.length > text.length * 0.5) {
                return structuralCut;
            }
        }

        return this.smartSentenceCut(text);
    }

    private cutAtCodeBoundary(text: string): string {
        const lines = text.split("\n");

        for (let i = Math.floor(lines.length * 0.7); i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line || /^\/\/|^\/\*|^#|^<!--/.test(line)) {
                return lines.slice(0, i + 1).join("\n");
            }
        }
        for (let i = Math.floor(lines.length * 0.6); i < lines.length; i++) {
            if (/^\s*[}\])]\s*;?\s*$/.test(lines[i])) {
                return lines.slice(0, i + 1).join("\n");
            }
        }

        return text;
    }

    private cutAtTableBoundary(text: string): string {
        const lines = text.split("\n");

        for (let i = lines.length - 1; i >= Math.floor(lines.length * 0.5); i--) {
            const line = lines[i];

            if (/[|\t]/.test(line) || /\s{3,}/.test(line)) {
                if (i < lines.length - 1 && !/[|\t]/.test(lines[i + 1]) && !/\s{3,}/.test(lines[i + 1])) {
                    return lines.slice(0, i + 1).join("\n");
                }
            }
        }

        return text;
    }

    private cutAtStructuralBoundary(text: string): string {
        const lines = text.split("\n");

        for (let i = Math.floor(lines.length * 0.7); i < lines.length; i++) {
            const line = lines[i];

            if (i < lines.length - 1) {
                const nextLine = lines[i + 1];

                if (/^#{1,2}\s*RN\d+|^---$/.test(nextLine)) {
                    return lines.slice(0, i + 1).join("\n");
                }

                if (/^#{1,3}\s|^===/.test(nextLine)) {
                    return lines.slice(0, i + 1).join("\n");
                }
            }

            if (/^\s*[-*+]\s|^\s*\d+[.)]\s/.test(line) && i < lines.length - 1 && !/^\s*[-*+]\s|^\s*\d+[.)]\s/.test(lines[i + 1])) {
                return lines.slice(0, i + 1).join("\n");
            }
        }

        return text;
    }

    private postProcess(chunks: string[], analysis: DocumentAnalysisInterface): string[] {
        return chunks
            .map((chunk) => this.cleanChunk(chunk, analysis))
            .filter((chunk) => {
                const trimmed = chunk.trim();

                return trimmed.length > 10 && !/^[\s\n]*$/.test(trimmed);
            })
            .map((chunk) => chunk.trim());
    }

    private cleanChunk(chunk: string, analysis: DocumentAnalysisInterface): string {
        let cleaned = chunk;

        cleaned = cleaned.replace(/^[\s\n]+/, "").replace(/[\s\n]+$/, "");

        if (analysis.hasCode) {
            const lines = cleaned.split("\n");

            const minIndent = lines
                .filter((l) => l.trim())
                .reduce((min, line) => {
                    const indent = line.match(/^\s*/)?.[0].length || 0;

                    return Math.min(min, indent);
                }, Infinity);

            if (minIndent > 0 && minIndent !== Infinity) {
                cleaned = lines.map((l) => l.slice(minIndent)).join("\n");
            }
        }

        return cleaned;
    }

    private sanitize(text: string): string {
        return text
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\t/g, "    ")
            .replace(/[ \u00A0]{2,}/g, " ")
            .replace(/\u200B/g, "")
            .replace(/\n{4,}/g, "\n\n")
            .trim();
    }

    private removeRepeatingLines(text: string, freqThreshold = 5): string {
        const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

        const counts = new Map<string, number>();
        const linePositions = new Map<string, number[]>();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.length < 40) {
                continue;
            }

            const normalized = line.toLowerCase().replace(/\s+/g, " ");
            counts.set(normalized, (counts.get(normalized) ?? 0) + 1);

            if (!linePositions.has(normalized)) {
                linePositions.set(normalized, []);
            }
            linePositions.get(normalized)!.push(i);
        }

        const repeated = new Set<string>();

        for (const [normalizedLine, count] of counts) {
            if (count >= freqThreshold) {
                const positions = linePositions.get(normalizedLine) || [];
                const isConsecutive = positions.some((pos, idx) => {
                    if (idx === 0) {
                        return false;
                    }
                    return positions[idx - 1] === pos - 1;
                });

                const originalLine = lines.find((l) => l.toLowerCase().replace(/\s+/g, " ") === normalizedLine);

                if (originalLine && isConsecutive) {
                    const hasStructuralMarkers = /^(#{1,6}\s|[-*+]\s|\d+\.\s|\|)/gm.test(originalLine);
                    const hasImportantKeywords = /\b(RN\d+|exemplo|importante|observação|nota|atenção)\b/gi.test(originalLine);

                    if (!hasStructuralMarkers && !hasImportantKeywords && originalLine.length < 250) {
                        repeated.add(normalizedLine);
                    }
                }
            }
        }

        if (repeated.size === 0) {
            return text;
        }

        const filtered = lines.filter((l) => {
            const normalized = l.toLowerCase().replace(/\s+/g, " ");

            return !repeated.has(normalized);
        });

        return filtered.join("\n");
    }

    private detectTabular(text: string): boolean {
        const sample = text.slice(0, 5000);
        const pipeCount = (sample.match(/\|/g) || []).length;
        const tabCount = (sample.match(/\t/g) || []).length;

        if (pipeCount > 6 || tabCount > 6) {
            return true;
        }

        const lines = sample.split("\n");
        let aligned = 0;

        for (const l of lines) {
            if (/\s{3,}/.test(l)) {
                aligned++;
            }
        }

        return aligned / Math.max(1, lines.length) > 0.12;
    }

    private detectStructure(text: string): boolean {
        const headCount = (text.match(/^#{1,6}\s/gm) || []).length;
        const listCount = (text.match(/^\s*[-*+]\s/gm) || []).length;
        const numList = (text.match(/^\s*\d+\.\s/gm) || []).length;
        const chap = /CAP[IÍ]TULO|Chapter|SECTION|Secção|CHAPTER/gi;
        const chapCount = (text.match(chap) || []).length;

        return headCount + listCount + numList + chapCount >= 2;
    }

    private mergeSmallBlocks(blocks: string[], tokenizer: (t: string) => number[], minBlockTokens: number): string[] {
        const out: string[] = [];

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const tok = tokenizer(b).length;
            const isRNSection = /^#{1,2}\s*RN\d+|^\*\*RN\d+/i.test(b);

            if (tok < minBlockTokens && !isRNSection) {
                if (i < blocks.length - 1) {
                    const nextIsRN = /^#{1,2}\s*RN\d+|^\*\*RN\d+/i.test(blocks[i + 1]);
                    if (!nextIsRN) {
                        blocks[i + 1] = b + "\n\n" + blocks[i + 1];
                    } else if (out.length > 0) {
                        out[out.length - 1] += "\n\n" + b;
                    } else {
                        out.push(b);
                    }
                } else if (out.length > 0) {
                    out[out.length - 1] += "\n\n" + b;
                } else {
                    out.push(b);
                }
            } else {
                out.push(b);
            }
        }
        return out;
    }

    private smartSentenceCut(text: string): string {
        if (text.length < 200) {
            return text;
        }

        const minCutPoint = Math.floor(text.length * 0.5);
        const targetCutPoint = Math.floor(text.length * 0.7);

        const boundaryRe =
            /(?<!\b(?:Dr|Mr|Mrs|Ms|Sr|Sra|Prof|etc|vs|ex|Jr|Ph\.D|[AÁÀÂÃÄÉÈÊÍÏÓÔÕÖÚÜÇ])\.?)([.!?…])(?=\s+[A-ZÀ-ŸÁÀÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝ"'\([])/g;

        let bestIndex = -1;
        let match: RegExpExecArray | null;

        while ((match = boundaryRe.exec(text)) !== null) {
            const cutPoint = match.index + match[0].length;

            if (cutPoint >= targetCutPoint) {
                bestIndex = cutPoint;
                break;
            }
            if (cutPoint >= minCutPoint) {
                bestIndex = cutPoint;
            }
        }

        if (bestIndex > 0) {
            return text.slice(0, bestIndex);
        }

        const delimiters = [
            { char: ".", weight: 1.0 },
            { char: "!", weight: 1.0 },
            { char: "?", weight: 1.0 },
            { char: ";", weight: 0.8 },
            { char: ":", weight: 0.6 },
            { char: ",", weight: 0.3 },
            { char: "\n", weight: 0.5 }
        ];

        for (const { char, weight } of delimiters) {
            const threshold = Math.floor(text.length * (0.5 * weight));
            const lastIdx = text.lastIndexOf(char);

            if (lastIdx > threshold) {
                return text.slice(0, lastIdx + 1);
            }
        }

        return text;
    }

    private finalClean(chunks: string[], tokenizer: (t: string) => number[], minBlockTokens: number) {
        const out: string[] = [];

        for (let c of chunks) {
            c = c.trim();

            if (!c) {
                continue;
            }

            const tok = tokenizer(c).length;

            if (tok < Math.max(20, Math.floor(minBlockTokens / 2)) && out.length > 0) {
                out[out.length - 1] += "\n\n" + c;
            } else {
                out.push(c);
            }
        }

        return out;
    }

    private semanticMergeJaccard(chunks: string[], threshold = 0.65, tokenizer?: (t: string) => number[]) {
        if (!tokenizer) {
            tokenizer = (t) => Array.from(this.getEncoding().encode(t));
        }

        const jaccard = (a: number[], b: number[]) => {
            const sa = new Set(a);
            const sb = new Set(b);
            const inter = [...sa].filter((x) => sb.has(x)).length;
            const uni = new Set([...a, ...b]).size;

            return uni === 0 ? 0 : inter / uni;
        };

        const out: string[] = [];
        let i = 0;

        while (i < chunks.length) {
            if (i < chunks.length - 1) {
                const a = tokenizer(chunks[i]);
                const b = tokenizer(chunks[i + 1]);
                const sim = jaccard(a, b);

                if (sim >= threshold) {
                    out.push((chunks[i] + "\n\n" + chunks[i + 1]).trim());
                    i += 2;
                    continue;
                }
            }

            out.push(chunks[i]);

            i++;
        }

        return out;
    }
}

