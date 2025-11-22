import { Processor } from "@nestjs/bullmq";
import { BaseProcessor } from "../../../infrastructure/processor/base-processor.processor";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { QdrantService } from "../../../infrastructure/qdrant/qdrant.service";
import { AiService } from "../../ai/ai.service";
import { Job } from "bullmq";
import { ProcessFileJob } from "../jobs/process-file.job";
import { randomUUID } from "node:crypto";
import { PointInterface } from "../../../infrastructure/qdrant/interfaces/qdrant.interface";
import { get_encoding, Tiktoken } from "tiktoken";

@Processor("process-file")
export class ProcessFileProcessor extends BaseProcessor implements OnModuleDestroy {
    readonly logger = new Logger(ProcessFileProcessor.name);
    private encoding: Tiktoken | null = null;

    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService
    ) {
        super();
    }

    private getEncoding(): Tiktoken {
        if (!this.encoding) {
            this.encoding = get_encoding("cl100k_base");
        }

        return this.encoding;
    }

    onModuleDestroy() {
        if (this.encoding) {
            this.encoding.free();
            this.encoding = null;
        }
    }

    async process(job: Job<ProcessFileJob>): Promise<void> {
        const { chunks, file, user, fileEntity } = job.data;

        if (!chunks?.length) {
            return;
        }

        const CONCURRENCY = Math.max(1, Number(process.env.AI_EMBEDDING_CONCURRENCY) || 3);

        const firstEmbedding = await this.aiService.getEmbedding(chunks[0]);

        if (!firstEmbedding?.length) {
            throw new Error("Embedding inválido.");
        }

        await this.qdrantService.ensureCollection("files", firstEmbedding.length);

        const encoding = this.getEncoding();

        const makePoint = (embedding: number[], index: number): PointInterface => {
            return {
                id: randomUUID(),
                vector: embedding,
                payload: {
                    text: chunks[index].trim(),
                    chunkIndex: index,
                    documentId: fileEntity.id,
                    userId: user.id,
                    filename: file.originalname,
                    chunkTokens: encoding.encode(chunks[index]).length
                }
            };
        };

        await this.qdrantService.saveVectors("files", [makePoint(firstEmbedding, 0)]);

        const total = chunks.length;
        let processed = 1;

        for (let i = 1; i < total; i += CONCURRENCY) {
            const batch = chunks.slice(i, i + CONCURRENCY);

            const batchEmbeddings = await Promise.all(batch.map((chunk) => this.aiService.getEmbedding(chunk)));

            const points = batchEmbeddings.map((embedding, offset) => makePoint(embedding, i + offset));

            await this.qdrantService.saveVectors("files", points);

            processed += points.length;
        }
    }
}

