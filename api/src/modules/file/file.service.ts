import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../../infrastructure/qdrant/qdrant.service";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { chunkTextSmartRobust } from "../../common/utils/functions.util";
import { SearchFileResponseDto } from "./dto/search-file-response.dto";

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

        const chunks = chunkTextSmartRobust(text);

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        const BATCH_SIZE = 5;
        const embeddings: number[][] = [];

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);

            const batchEmbeddings = await Promise.all(
                batch.map(async (chunk) => {
                    try {
                        return await this.aiService.getEmbedding(chunk);
                    } catch (error) {
                        throw error;
                    }
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
    }

    public async searchFile(searchFileDto: SearchFileRequestDto): Promise<SearchFileResponseDto> {
        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Erro ao gerar embedding para a busca.");
        }

        const searchResults = await this.qdrantService.search("files", queryEmbedding);

        if (searchResults.length === 0) {
            return { response: "Nenhum trecho relevante encontrado para a consulta fornecida." };
        }

        const rankedResults = this.rerankResults(searchResults);

        const topResults = rankedResults.slice(0, 5);

        const combinedText = topResults
            .map((result, idx) => `[Trecho ${idx + 1}] (Relevância: ${(result.score * 100).toFixed(1)}%)\n${result.text}`)
            .join("\n\n---\n\n");

        const aiResponse = await this.aiService.generateResponse(
            `Você é um assistente especializado em análise de documentos. Responda à consulta do usuário usando APENAS as informações dos trechos fornecidos abaixo.

            Trechos de documentos (ordenados por relevância):
            ${combinedText}

            Consulta do usuário: ${searchFileDto.search}

            Instruções:
            - Responda de forma clara, objetiva e em português com uma única resposta consolidada.
            - Se possível, forneça exemplos ou citações diretas dos trechos para apoiar sua resposta.
            - Se a consulta não puder ser respondida com as informações fornecidas, informe que não há dados suficientes.
            - NÃO invente informações ou responda com base em conhecimento prévio.
            - Use apenas informações dos trechos fornecidos
            - Se os trechos não contiverem informação suficiente, informe isso
            - Cite os números dos trechos relevantes entre colchetes [Trecho X]

            Resposta:`
        );

        return { response: aiResponse };
    }

    private rerankResults(results: Array<{ score: number; text: string }>): Array<{ score: number; text: string }> {
        const unique: Array<{ score: number; text: string }> = [];

        for (const result of results) {
            const isDuplicate = unique.some((u) => {
                const similarity = this.calculateTextSimilarity(u.text, result.text);

                return similarity > 0.8;
            });

            if (!isDuplicate) {
                unique.push(result);
            }
        }

        return unique.sort((a, b) => b.score - a.score);
    }

    private calculateTextSimilarity(text1: string, text2: string): number {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }
}

