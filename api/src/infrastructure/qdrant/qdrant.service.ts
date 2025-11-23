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
                        m: 32,
                        ef_construct: 256,
                        on_disk: false
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
                    m: 32,
                    ef_construct: 256,
                    on_disk: false
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
        limit = 100,
        scoreThreshold = 0.001
    ): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(collection, {
            vector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
            with_vector: false,
            params: {
                hnsw_ef: 128,
                exact: false
            },
            filter: {
                must: [
                    { key: "userId", match: { value: user.id } }
                    // { key: "documentId", match: { value: documentId } }
                ]
            }
        });

        return result.map((r) => ({
            score: r.score,
            text: r.payload?.text as string
        }));
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

