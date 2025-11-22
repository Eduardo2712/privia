export interface SmartChunkerOptsInterface {
    text: string;
    maxTokens?: number;
    overlapTokens?: number;
    minBlockTokens?: number;
    semanticMergeThreshold?: number;
    tokenizer?: (text: string) => number[];
    detokenizer?: (tokens: number[]) => string;
}

export interface SearchFileStreamResponseInterface {
    stream: AsyncIterable<string>;
    references: Array<{ text: string; index: number }>;
    timeInMs: number;
}

