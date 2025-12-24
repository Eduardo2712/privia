import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import { UpsertPointInterface } from "./interfaces/qdrant.interface";

@Injectable()
export class QdrantService {
    readonly client: QdrantClient;
    readonly collectionName = "files";

    constructor() {
        this.client = new QdrantClient({ url: process.env.QDRANT_URL });
    }

    async ensureCollection(vectorSize: number): Promise<void> {
        try {
            const info = await this.client.getCollection(this.collectionName);

            const existingSize = info.config.params.vectors?.size;

            if (existingSize && existingSize !== vectorSize) {
                await this.client.deleteCollection(this.collectionName);

                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: vectorSize,
                        distance: "Cosine"
                    },
                    hnsw_config: {
                        m: 16,
                        ef_construct: 100,
                        on_disk: false
                    },
                    optimizers_config: {
                        indexing_threshold: 10000
                    }
                });
            }
        } catch {
            await this.client.createCollection(this.collectionName, {
                vectors: {
                    size: vectorSize,
                    distance: "Cosine"
                },
                hnsw_config: {
                    m: 16,
                    ef_construct: 100,
                    on_disk: false
                },
                optimizers_config: {
                    indexing_threshold: 10000
                }
            });
        }
    }

    async saveVectors(points: UpsertPointInterface[]): Promise<void> {
        const batchSize = 100;

        for (let i = 0; i < points.length; i += batchSize) {
            const batch = points.slice(i, i + batchSize);

            try {
                await this.client.upsert(this.collectionName, { points: batch });
            } catch (err) {
                throw new Error(`Erro ao salvar vetores: ${err}`);
            }
        }
    }

    async search(
        userId: number,
        documentId: number,
        vector: number[],
        limit = 15,
        scoreThreshold = 0.3
    ): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(this.collectionName, {
            vector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
            with_vector: false,
            params: {
                hnsw_ef: 32,
                exact: false
            },
            filter: {
                must: [
                    { key: "userId", match: { value: userId } },
                    { key: "documentId", match: { value: documentId } }
                ]
            }
        });

        return result.map((r) => ({
            score: r.score,
            text: r.payload?.text as string
        }));
    }

    async deleteByFilter(userId: number, documentId: number): Promise<void> {
        await this.client.delete(this.collectionName, {
            filter: {
                must: [
                    { key: "userId", match: { value: userId } },
                    { key: "documentId", match: { value: documentId } }
                ]
            }
        });
    }
}

