import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../../infrastructure/qdrant/qdrant.service";

@Injectable()
export class FileService {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService
    ) {}

    public async uploadFile(file: Express.Multer.File): Promise<void> {
        if (!file?.buffer) {
            throw new Error("O buffer de arquivos enviados está vazio.");
        }

        const text = file.buffer.toString("utf-8");

        const chunks = text.match(/.{1,500}/g);

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        const embeddings: number[][] = [];

        for (const chunk of chunks) {
            const embedding = await this.aiService.generateEmbedding(chunk);

            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error("Erro ao gerar embedding para o chunk do arquivo.");
            }

            embeddings.push(embedding);
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
                    chunkIndex: index
                }
            }))
        );
    }
}

