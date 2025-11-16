export interface SmartChunkerOptsInterface {
    text: string;
    maxTokens?: number;
    overlapTokens?: number;
    minBlockTokens?: number;
    semanticMergeThreshold?: number;
    tokenizer?: (text: string) => number[];
    detokenizer?: (tokens: number[]) => string;
}
