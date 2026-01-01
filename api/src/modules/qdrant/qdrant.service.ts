import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import { UpsertPointInterface } from "./interfaces/qdrant.interface";

@Injectable()
export class QdrantService {
    private readonly client: QdrantClient;
    private readonly collectionName = "files";
    private readonly batchSize = 250;
    private readonly searchLimit = 20;
    private readonly scoreThreshold = 0.22;

    constructor() {
        this.client = new QdrantClient({ url: process.env.QDRANT_URL });
    }

    async ensureCollection(vectorSize: number): Promise<void> {
        try {
            const info = await this.client.getCollection(this.collectionName);
            if (info.config.params.vectors?.size !== vectorSize) {
                await this.client.deleteCollection(this.collectionName);
                await this.createCollection(vectorSize);
            }
        } catch {
            await this.createCollection(vectorSize);
        }
    }

    private async createCollection(vectorSize: number): Promise<void> {
        await this.client.createCollection(this.collectionName, {
            vectors: { size: vectorSize, distance: "Cosine" },
            hnsw_config: { m: 12, ef_construct: 64, on_disk: false },
            quantization_config: { scalar: { type: "int8", quantile: 0.99, always_ram: true } }
        });
    }

    async saveVectors(points: UpsertPointInterface[]): Promise<void> {
        for (let i = 0; i < points.length; i += this.batchSize) {
            await this.client.upsert(this.collectionName, {
                points: points.slice(i, i + this.batchSize)
            });
        }
    }

    async search(userId: number, documentId: number, vector: number[]): Promise<Array<{ score: number; text: string }>> {
        const result = await this.client.search(this.collectionName, {
            vector,
            limit: this.searchLimit,
            score_threshold: this.scoreThreshold,
            with_payload: true,
            with_vector: false,
            params: { hnsw_ef: 32, exact: false },
            filter: {
                must: [
                    { key: "userId", match: { value: userId } },
                    { key: "documentId", match: { value: documentId } }
                ]
            }
        });

        return result.map((r) => ({ score: r.score, text: r.payload?.text as string }));
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

