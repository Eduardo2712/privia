import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";

type UpsertPoint = {
    id: number | string;
    vector: number[] | Record<string, number[]>;
    payload?: Record<string, unknown>;
};

@Injectable()
export class QdrantService {
    readonly client: QdrantClient;

    constructor() {
        this.client = new QdrantClient({ url: process.env.QDRANT_URL });
    }

    async ensureCollection(name: string, vectorSize: number): Promise<void> {
        try {
            const info = await this.client.getCollection(name);

            const legacyVectors = (info as unknown as { vectors?: { size?: number } }).vectors;
            const existingSize = info?.config?.params?.vectors?.size ?? legacyVectors?.size;

            if (existingSize && existingSize !== vectorSize) {
                await this.client.deleteCollection(name);

                await this.client.createCollection(name, {
                    vectors: { size: vectorSize, distance: "Cosine" }
                });
            }
        } catch {
            await this.client.createCollection(name, {
                vectors: { size: vectorSize, distance: "Cosine" }
            });
        }
    }

    async saveVectors(collection: string, points: UpsertPoint[]): Promise<void> {
        const batchSize = 100;

        for (let i = 0; i < points.length; i += batchSize) {
            const batch = points.slice(i, i + batchSize);

            try {
                await this.client.upsert(collection, {
                    wait: true,
                    points: batch
                });
            } catch (err: unknown) {
                throw err;
            }
        }
    }

    async search(collection: string, vector: number[]): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(collection, {
            vector,
            limit: 3
        });

        return result.map((r) => {
            const text: string =
                typeof (r as unknown as { payload?: { text?: unknown } }).payload?.text === "string"
                    ? ((r as unknown as { payload?: { text?: string } }).payload!.text as string)
                    : "";

            return {
                score: r.score,
                text
            };
        });
    }
}

