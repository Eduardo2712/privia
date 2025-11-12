import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import { UpsertPointInterface } from "./interfaces/qdrant.interface";

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
                    vectors: {
                        size: vectorSize,
                        distance: "Cosine"
                    },
                    optimizers_config: {
                        indexing_threshold: 10000
                    },
                    hnsw_config: {
                        m: 16,
                        ef_construct: 100
                    }
                });
            }
        } catch {
            await this.client.createCollection(name, {
                vectors: {
                    size: vectorSize,
                    distance: "Cosine"
                },
                optimizers_config: {
                    indexing_threshold: 10000
                },
                hnsw_config: {
                    m: 16,
                    ef_construct: 100
                }
            });
        }
    }

    async saveVectors(collection: string, points: UpsertPointInterface[]): Promise<void> {
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

    async search(collection: string, vector: number[], limit = 10, scoreThreshold = 0.5): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(collection, {
            vector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
            with_vector: false
        });

        return result
            .filter((r) => r.score >= scoreThreshold)
            .map((r) => {
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

