export interface UpsertPointInterface {
    id: number | string;
    vector: number[] | Record<string, number[]>;
    payload?: Record<string, unknown>;
}

