export interface UpsertPointInterface {
    id: number | string;
    vector: number[] | Record<string, number[]>;
    payload?: Record<string, unknown>;
}

export interface PointInterface {
    id: string;
    vector: number[];
    payload: {
        userId: number;
        documentId: number;
        text: string;
        chunkIndex: number;
        filename: string;
        chunkTokens: number;
    };
}

