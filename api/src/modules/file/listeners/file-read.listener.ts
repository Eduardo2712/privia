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
        const BATCH_SIZE = 5;
        const embeddings: number[][] = [];

        const chunks = event.chunks;
        const file = event.file;

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);

            const batchEmbeddings = await Promise.all(
                batch.map(async (chunk) => {
                    return await this.aiService.getEmbedding(chunk);
                })
            );

            embeddings.push(...batchEmbeddings);
        }

        if (!embeddings[0] || embeddings[0].length === 0) {
            throw new Error("Dimensão do embedding inválida (0). Abortando persistência no Qdrant.");
        }

        await this.qdrantService.ensureCollection("files", embeddings[0].length);

        await this.qdrantService.saveVectors(
            "files",
            embeddings.map((embedding, index) => ({
                id: randomUUID(),
                vector: embedding,
                payload: {
                    text: chunks[index],
                    fileId: file.filename,
                    fileName: file.originalname,
                    chunkIndex: index,
                    totalChunks: chunks.length,
                    timestamp: new Date().toISOString(),
                    textLength: chunks[index].length
                }
            }))
        );

        console.log(`FileReadListener: Processamento concluído. ${embeddings.length} embeddings salvos no Qdrant.`);
    }
}

