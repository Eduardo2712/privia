export interface SearchFileStreamResponseInterface {
    stream: AsyncIterable<string>;
    references: Array<{ text: string; index: number }>;
    timeInMs: number;
}

