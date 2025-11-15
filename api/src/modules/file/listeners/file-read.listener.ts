import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FileReadEvent } from "../events/file-read.event";
import { AiService } from "../../ai/ai.service";
import { QdrantService } from "../../../infrastructure/qdrant/qdrant.service";
import { randomUUID } from "node:crypto";
import { PointInterface } from "../../../infrastructure/qdrant/interfaces/qdrant.interface";

@Injectable()
export class FileReadListener {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService
    ) {}

    @OnEvent("file.read")
    async handle(event: FileReadEvent): Promise<void> {
        console.log("FileReadListener: Evento 'file.read' recebido. Processando...");

        const { chunks, file } = event;

        if (!chunks?.length) {
            return;
        }

        const CONCURRENCY = Math.max(1, Number(process.env.AI_EMBEDDING_CONCURRENCY) || 3);

        const firstEmbedding = await this.aiService.getEmbedding(chunks[0]);

        if (!firstEmbedding?.length) {
            throw new Error("Embedding inválido.");
        }

        await this.qdrantService.ensureCollection("files", firstEmbedding.length);

        // await this.qdrantService.deleteByFilter("documents", {
        //     must: [
        //         { key: "userId", match: { value: userId } },
        //         { key: "documentId", match: { value: documentId } }
        //     ]
        // });

        const makePoint = (embedding: number[], index: number): PointInterface => {
            return {
                id: randomUUID(),
                vector: embedding,
                payload: {
                    text: chunks[index].trim(),
                    chunkIndex: index,
                    documentId: 1,
                    userId: 1,
                    filename: file.originalname
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
            console.log(`Qdrant: ${processed}/${total} chunks salvos`);
        }

        console.log(`FileReadListener: Finalizado. Total: ${total}`);
    }
}

