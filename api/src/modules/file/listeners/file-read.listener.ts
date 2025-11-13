import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FileReadEvent } from "../events/file-read.event";
import { AiService } from "../../ai/ai.service";
import { QdrantService } from "../../../infrastructure/qdrant/qdrant.service";
import { randomUUID } from "node:crypto";

@Injectable()
export class FileReadListener {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService
    ) {}

    @OnEvent("file.read")
    async handle(event: FileReadEvent): Promise<void> {
        console.log("FileReadListener: Evento 'file.read' recebido. Processando...");

        const chunks = event.chunks;
        const file = event.file;

        if (!chunks || chunks.length === 0) {
            return;
        }

        const CONCURRENCY = Math.max(1, Number(process.env.AI_EMBEDDING_CONCURRENCY));

        const firstEmbedding = await this.aiService.getEmbedding(chunks[0]);

        if (!firstEmbedding || firstEmbedding.length === 0) {
            throw new Error("Dimensão do embedding inválida (0). Abortando persistência no Qdrant.");
        }

        await this.qdrantService.ensureCollection("files", firstEmbedding.length);

        const makePoint = (embedding: number[], index: number) => {
            const text = chunks[index];
            const words = text.split(/\s+/).filter((w) => w.length > 0);

            const keywords = words
                .filter((w) => w.length >= 4)
                .map((w) => w.toLowerCase().replaceAll(/[^\w]/g, ""))
                .filter((w) => w.length >= 4);

            return {
                id: randomUUID(),
                vector: embedding,
                payload: {
                    text: text,
                    fileId: file.filename,
                    fileName: file.originalname,
                    chunkIndex: index,
                    totalChunks: chunks.length,
                    timestamp: new Date().toISOString(),
                    textLength: text.length,
                    wordCount: words.length,
                    keywords: Array.from(new Set(keywords)).slice(0, 10),
                    hasNumbers: /\d/.test(text),
                    hasBulletPoints: /^[\s-•*]\s/m.test(text),
                    sentenceCount: (text.match(/[.!?]+/g) || []).length
                }
            };
        };

        await this.qdrantService.saveVectors("files", [makePoint(firstEmbedding, 0)]);

        const total = chunks.length;
        let processed = 1;

        for (let i = 1; i < total; i += CONCURRENCY) {
            const batchStart = i;
            const batchEnd = Math.min(i + CONCURRENCY, total);
            const batch = chunks.slice(batchStart, batchEnd);

            const batchEmbeddings = await Promise.all(batch.map(async (chunk) => this.aiService.getEmbedding(chunk)));

            const points = batchEmbeddings.map((embedding, offset) => makePoint(embedding, batchStart + offset));

            await this.qdrantService.saveVectors("files", points);

            processed += points.length;
            console.log(`FileReadListener: ${processed}/${total} embeddings salvos no Qdrant...`);
        }

        console.log(`FileReadListener: Processamento concluído. ${total} embeddings salvos no Qdrant.`);
    }
}

