import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../../infrastructure/qdrant/qdrant.service";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { ChunkerFileService } from "./chunker-file.service";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { InjectQueue } from "@nestjs/bullmq";
import { ProcessFileJob } from "./jobs/process-file.job";
import { Queue } from "bullmq";
import { SearchFileStreamResponseInterface } from "./interfaces/file.interface";
import { MinioFileService } from "./minio-file.service";
import { ListFileRequestDto } from "./dto/list-file-request.dto";
import { FileRepository } from "./entities/file.repository";
import { ListFileResponseDto } from "./dto/list-file-response.dto";

@Injectable()
export class FileService {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService,
        private readonly minioFileService: MinioFileService,
        private readonly chunkerFileService: ChunkerFileService,
        private readonly fileRepository: FileRepository,
        @InjectQueue("process-file") private readonly processFileQueue: Queue<ProcessFileJob>
    ) {}

    public async readFile(user: LoggedUserInterface, file: Express.Multer.File): Promise<void> {
        if (!file?.buffer) {
            throw new Error("O buffer de arquivos enviados está vazio.");
        }

        const text = file.buffer.toString("utf-8");

        const chunks = await this.chunkerFileService.chunkText(text);

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        const newFile = await this.minioFileService.create(file, user);

        await this.processFileQueue.add("process-file", new ProcessFileJob(chunks, file, user, newFile), {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        });
    }

    public async searchFileStream(user: LoggedUserInterface, searchFileDto: SearchFileRequestDto): Promise<SearchFileStreamResponseInterface> {
        const startTime = Date.now();

        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Erro ao gerar embedding para a busca.");
        }

        const documentId = 1; // FAZER
        const searchResults = await this.qdrantService.search(user, documentId, "files", queryEmbedding, 24, 0.2);

        if (searchResults.length === 0) {
            const emptyIterator: AsyncIterable<string> = {
                async *[Symbol.asyncIterator]() {
                    yield "Informação não encontrada nos trechos.";
                }
            };

            return { stream: emptyIterator, references: [], timeInMs: Date.now() - startTime };
        }

        const rerankedChunks = this.chunkerFileService.rerankByKeywords(searchResults, searchFileDto.search);
        const topChunks = rerankedChunks.slice(0, 6);

        const stream = await this.aiService.generateResponseStream(topChunks, searchFileDto.search);

        const references = topChunks.map((r, i) => ({ text: r.text, index: i + 1 }));

        return { stream, references, timeInMs: Date.now() - startTime };
    }

    public async list(user: LoggedUserInterface, listFileRequestDto: ListFileRequestDto): Promise<ListFileResponseDto> {
        const result = await this.fileRepository.listFiles(user, listFileRequestDto);

        const items = await Promise.all(
            result.items.map(async (file) => ({
                url: await this.minioFileService.getUrl(file.name),
                id: file.id,
                name: file.name
            }))
        );

        return {
            items,
            page: listFileRequestDto.page,
            totalItems: result.total,
            totalPages: Math.ceil(result.total / 10)
        };
    }
}

