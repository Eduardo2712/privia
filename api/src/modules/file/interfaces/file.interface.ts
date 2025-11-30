export interface SearchFileStreamResponseInterface {
    stream: AsyncIterable<string>;
    references: Array<{ text: string; index: number }>;
    timeInMs: number;
}

export interface ChunkOptionsInterface {
    chunkSizeTokens?: number;
    chunkOverlapTokens?: number;
    separators?: string[];
    semantic?: boolean;
    strategy?: "fine" | "coarse" | "chapter";
}

