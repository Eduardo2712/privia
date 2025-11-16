import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import { UpsertPointInterface } from "./interfaces/qdrant.interface";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";

@Injectable()
export class QdrantService {
    readonly client: QdrantClient;

    constructor() {
        this.client = new QdrantClient({ url: process.env.QDRANT_URL });
    }

    async ensureCollection(name: string, vectorSize: number): Promise<void> {
        try {
            const info = await this.client.getCollection(name);

            const existingSize = info.config.params.vectors?.size;

            if (existingSize && existingSize !== vectorSize) {
                await this.client.deleteCollection(name);

                await this.client.createCollection(name, {
                    vectors: {
                        size: vectorSize,
                        distance: "Cosine"
                    },
                    hnsw_config: {
                        m: 16,
                        ef_construct: 200,
                        ef_search: 128
                    }
                });
            }
        } catch {
            await this.client.createCollection(name, {
                vectors: {
                    size: vectorSize,
                    distance: "Cosine"
                },
                hnsw_config: {
                    m: 16,
                    ef_construct: 200,
                    ef_search: 128
                }
            });
        }
    }

    async saveVectors(collection: string, points: UpsertPointInterface[]): Promise<void> {
        const batchSize = 100;

        for (let i = 0; i < points.length; i += batchSize) {
            const batch = points.slice(i, i + batchSize);

            try {
                await this.client.upsert(collection, { points: batch });
            } catch (err) {
                throw err;
            }
        }
    }

    async search(
        user: LoggedUserInterface,
        documentId: number,
        collection: string,
        vector: number[],
        limit = 5,
        scoreThreshold = 0.5
    ): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(collection, {
            vector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
            with_vector: false,
            filter: {
                must: [
                    { key: "userId", match: { value: user.id } },
                    { key: "documentId", match: { value: documentId } }
                ]
            }
        });

        return result.map((r) => {
            const text = (r.payload?.text as string) || "";

            return {
                score: r.score,
                text
            };
        });
    }

    async deleteByFilter(collection: string, userId: number, documentId: number): Promise<void> {
        await this.client.delete(collection, {
            filter: {
                must: [
                    { key: "userId", match: { value: userId } },
                    { key: "documentId", match: { value: documentId } }
                ]
            }
        });
    }
}

