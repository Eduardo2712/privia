export interface SearchFileStreamResponseInterface {
    stream: AsyncIterable<string>;
}

export interface ChunkOptionsInterface {
    chunkSizeTokens?: number;
    chunkOverlapTokens?: number;
    separators?: string[];
    semantic?: boolean;
    strategy?: "fine" | "coarse" | "chapter";
}

