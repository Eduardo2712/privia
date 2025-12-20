import { Processor } from "@nestjs/bullmq";
import { BaseProcessor } from "../../../infrastructure/processor/base-processor.processor";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { QdrantService } from "../../qdrant/qdrant.service";
import { AiService } from "../../ai/ai.service";
import { Job } from "bullmq";
import { ProcessFileJob } from "../jobs/process-file.job";
import { randomUUID } from "node:crypto";
import { PointInterface } from "../../qdrant/interfaces/qdrant.interface";
import { get_encoding, Tiktoken } from "tiktoken";
import { FileRepository } from "../repositories/file.repository";
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

    private socketEmitProgress(userId: number, fileId: number, progress: number) {
        this.socketService.emitToUser(userId, "file:progress", {
            id: fileId,
            progress
        });
    }

    private socketEmitProcessed(userId: number, fileId: number) {
        this.socketService.emitToUser(userId, "file:processed", { id: fileId });
    }

    async process(job: Job<ProcessFileJob>): Promise<void> {
        try {
            const { chunks, file, user, fileEntity } = job.data;

            if (!chunks?.length) {
                return;
            }

            this.socketEmitProgress(user.id, fileEntity.id, 0);

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

            const embeddingProgress = Math.round((1 / chunks.length) * 40);

            this.socketEmitProgress(user.id, fileEntity.id, embeddingProgress);

            for (let i = 1; i < chunks.length; i += CONCURRENCY) {
                const batch = chunks.slice(i, i + CONCURRENCY);
                const batchEmbeddings = await Promise.all(batch.map((chunk) => this.aiService.getEmbedding(chunk)));
                const points = batchEmbeddings.map((embedding, offset) => makePoint(embedding, i + offset));

                allPoints.push(...points);

                const processedCount = Math.min(i + CONCURRENCY, chunks.length);
                const progress = Math.round((processedCount / chunks.length) * 40);

                this.socketEmitProgress(user.id, fileEntity.id, progress);
            }

            this.socketEmitProgress(user.id, fileEntity.id, 40);

            await this.qdrantService.saveVectors(allPoints);

            this.socketEmitProgress(user.id, fileEntity.id, 60);

            const response = await this.aiService.generateSummaryAndSuggestions(job.data.text);

            await this.fileRepository.update(fileEntity.id, {
                summary: response.summary ?? "",
                suggestedQuestions: response.questions ?? [],
                isProcessed: true
            });

            this.socketEmitProgress(user.id, fileEntity.id, 100);

            this.socketEmitProcessed(user.id, fileEntity.id);
        } catch (err) {
            this.qdrantService.deleteByFilter(job.data.user.id, job.data.fileEntity.id);

            this.logger.error(`Erro ao processar arquivo ID ${job.data.fileEntity.id}: ${err.message}`, err.stack);

            throw err;
        }
    }
}

