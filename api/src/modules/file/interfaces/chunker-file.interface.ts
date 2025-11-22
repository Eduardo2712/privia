import { DocumentType } from "../enums/file.enum";

export interface SmartChunkerOptionsInterface {
    text: string;
    maxTokens?: number;
    overlapTokens?: number;
    minBlockTokens?: number;
    semanticMergeThreshold?: number | null;
    tokenizer?: (t: string) => number[];
    detokenizer?: (ids: number[]) => string;
}

export interface DocumentAnalysisInterface {
    type: DocumentType;
    hasCode: boolean;
    hasMarkdown: boolean;
    hasTables: boolean;
    hasLists: boolean;
    hasHeadings: boolean;
    language: string;
    avgLineLength: number;
    structure: "high" | "medium" | "low";
}

