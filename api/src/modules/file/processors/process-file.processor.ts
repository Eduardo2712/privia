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
import { FileRepository } from "../entities/file.repository";
import { SocketService } from "../../socket/socket.service";

@Processor("process-file")
export class ProcessFileProcessor extends BaseProcessor implements OnModuleDestroy {
    readonly logger = new Logger(ProcessFileProcessor.name);
    private encoding: Tiktoken | null = null;

    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService,
        private readonly fileRepository: FileRepository,
        private readonly socketService: SocketService
    ) {
        super();
    }

    private getEncoding(): Tiktoken {
        this.encoding ??= get_encoding("cl100k_base");

        return this.encoding;
    }

    onModuleDestroy() {
        if (this.encoding) {
            this.encoding.free();

            this.encoding = null;
        }
    }

    async process(job: Job<ProcessFileJob>): Promise<void> {
        try {
            const { chunks, file, user, fileEntity } = job.data;

            if (!chunks?.length) {
                return;
            }

            const CONCURRENCY = Math.max(1, Number(process.env.AI_EMBEDDING_CONCURRENCY) || 12);

            const firstEmbedding = await this.aiService.getEmbedding(chunks[0]);

            if (!firstEmbedding?.length) {
                throw new Error("Embedding inválido.");
            }

            await this.qdrantService.ensureCollection(firstEmbedding.length);

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

            const allPoints: PointInterface[] = [makePoint(firstEmbedding, 0)];

            for (let i = 1; i < chunks.length; i += CONCURRENCY) {
                const batch = chunks.slice(i, i + CONCURRENCY);
                const batchEmbeddings = await Promise.all(batch.map((chunk) => this.aiService.getEmbedding(chunk)));
                const points = batchEmbeddings.map((embedding, offset) => makePoint(embedding, i + offset));
                allPoints.push(...points);
            }

            await this.qdrantService.saveVectors(allPoints);

            const summary = await this.aiService.generateSummary(job.data.text);

            await this.fileRepository.update(fileEntity.id, {
                summary: summary ?? "",
                isProcessed: true
            });

            this.socketService.emitToUser(user.id, "file:processed", [{ id: fileEntity.id }]);
        } catch (err) {
            this.qdrantService.deleteByFilter(job.data.user.id, job.data.fileEntity.id);

            throw err;
        }
    }
}

