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
    private readonly CONCURRENCY = Math.max(1, Number(process.env.AI_EMBEDDING_CONCURRENCY) || 8);

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
            const { chunks, userId, fileEntity, text } = job.data;
            const filename = fileEntity.name;

            if (!chunks?.length) return;

            this.socketEmit(userId, fileEntity.id, 0);

            const firstEmbedding = await this.aiService.getEmbedding(chunks[0]);
            if (!firstEmbedding?.length) throw new Error("Embedding inválido.");

            await this.qdrantService.ensureCollection(firstEmbedding.length);

            const encoding = this.getEncoding();
            const points = await this.generateEmbeddings(chunks, firstEmbedding, userId, fileEntity.id, filename, encoding);

            this.socketEmit(userId, fileEntity.id, 40);
            await this.qdrantService.saveVectors(points);

            this.socketEmit(userId, fileEntity.id, 60);
            const { summary, questions } = await this.aiService.generateSummaryAndSuggestions(text);

            await this.fileRepository.update(fileEntity.id, {
                summary: summary ?? "",
                suggestedQuestions: questions ?? [],
                isProcessed: true
            });

            this.socketEmit(userId, fileEntity.id, 100);
        } catch (err) {
            await this.qdrantService.deleteByFilter(job.data.userId, job.data.fileEntity.id);
            this.logger.error(`Erro ao processar arquivo ID ${job.data.fileEntity.id}: ${err.message}`, err.stack);
            throw err;
        }
    }

    private async generateEmbeddings(
        chunks: string[],
        firstEmbedding: number[],
        userId: number,
        fileId: number,
        filename: string,
        encoding: Tiktoken
    ): Promise<PointInterface[]> {
        const points: PointInterface[] = [this.makePoint(firstEmbedding, chunks[0], 0, userId, fileId, filename, encoding)];

        for (let i = 1; i < chunks.length; i += this.CONCURRENCY) {
            const batch = chunks.slice(i, i + this.CONCURRENCY);
            const embeddings = await Promise.all(batch.map((c) => this.aiService.getEmbedding(c)));

            embeddings.forEach((emb, idx) => {
                points.push(this.makePoint(emb, chunks[i + idx], i + idx, userId, fileId, filename, encoding));
            });
        }

        return points;
    }

    private makePoint(
        embedding: number[],
        text: string,
        index: number,
        userId: number,
        fileId: number,
        filename: string,
        encoding: Tiktoken
    ): PointInterface {
        return {
            id: randomUUID(),
            vector: embedding,
            payload: {
                text: text.trim(),
                chunkIndex: index,
                documentId: fileId,
                userId,
                filename,
                chunkTokens: encoding.encode(text).length
            }
        };
    }

    private socketEmit(userId: number, fileId: number, progress: number): void {
        this.socketService.emitToUser(userId, "file:progress", { id: fileId, progress });
    }
}

