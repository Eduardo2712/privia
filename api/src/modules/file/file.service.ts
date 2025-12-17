import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../qdrant/qdrant.service";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { ChunkerFileService } from "./chunker-file.service";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { InjectQueue } from "@nestjs/bullmq";
import { ProcessFileJob } from "./jobs/process-file.job";
import { Queue } from "bullmq";
import { SearchFileStreamResponseInterface } from "./interfaces/file.interface";
import { MinioFileService } from "./minio-file.service";
import { ListFileRequestDto } from "./dto/list-file-request.dto";
import { FileRepository } from "./repositories/file.repository";
import { ListFileResponseDto } from "./dto/list-file-response.dto";
import { plainToInstance } from "class-transformer";
import { FileResponseDto } from "./dto/file-response.dto";
import { GetFileResponseDto } from "./dto/get-file.response.dto";
import { ReadFileResponseDto } from "./dto/read-file.response.dto";

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

    public async readFile(user: LoggedUserInterface, file: Express.Multer.File): Promise<ReadFileResponseDto> {
        if (!file?.buffer) {
            throw new Error("O buffer de arquivos enviados está vazio.");
        }

        const text = file.buffer.toString("utf-8");

        const chunks = await this.chunkerFileService.chunkText(text);

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        const objectName = await this.minioFileService.create(file);

        const newFile = await this.fileRepository.create({
            path: objectName,
            name: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            userId: user.id
        });

        await this.processFileQueue.add("process-file", new ProcessFileJob(chunks, file, user, newFile, text), {
            attempts: 1,
            backoff: { type: "exponential", delay: 5000 }
        });

        const fileDto = plainToInstance(
            ReadFileResponseDto,
            {
                ...newFile,
                url: await this.minioFileService.getUrl(newFile.path)
            },
            { excludeExtraneousValues: true }
        );

        return fileDto;
    }

    public async searchFileStream(user: LoggedUserInterface, searchFileDto: SearchFileRequestDto): Promise<SearchFileStreamResponseInterface> {
        const startTime = Date.now();

        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Erro ao gerar embedding para a busca.");
        }

        const documentId = searchFileDto.documentId;
        const searchResults = await this.qdrantService.search(user, documentId, queryEmbedding, 25, 0.25);

        if (searchResults.length === 0) {
            const emptyIterator: AsyncIterable<string> = {
                async *[Symbol.asyncIterator]() {
                    yield "Informação não encontrada nos trechos.";
                }
            };

            return {
                stream: emptyIterator,
                references: [],
                timeInMs: Date.now() - startTime
            };
        }

        const rerankedChunks = this.chunkerFileService.rerankHybrid(searchResults, searchFileDto.search);
        const seen = new Set<string>();

        const compact = rerankedChunks
            .map((c) => {
                const maxLen = 950;
                let t = c.text.trim();

                if (t.length > maxLen) {
                    const trimmed = t.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");

                    t = lastPeriod > maxLen * 0.7 ? trimmed.substring(0, lastPeriod + 1) : trimmed;
                }
                return { score: c.score, text: t };
            })
            .filter((c) => {
                const sig = c.text.substring(0, 120).toLowerCase().replaceAll(/\s+/g, " ");

                if (seen.has(sig)) {
                    return false;
                }

                seen.add(sig);

                return true;
            });

        const topChunks = compact.slice(0, 5);

        const stream = await this.aiService.generateResponseStream(topChunks, searchFileDto.search, { k: 5, promptMode: "STRICT_QUOTE" });

        const references = topChunks.map((r, i) => ({ text: r.text, index: i + 1 }));

        return { stream, references, timeInMs: Date.now() - startTime };
    }

    public async list(user: LoggedUserInterface, listFileRequestDto: ListFileRequestDto): Promise<ListFileResponseDto> {
        const result = await this.fileRepository.listFiles(user, listFileRequestDto);

        const mapped = await Promise.all(
            result.items.map(async (f) => ({
                ...f,
                url: await this.minioFileService.getUrl(f.path)
            }))
        );

        const items = plainToInstance(FileResponseDto, mapped, { excludeExtraneousValues: true });

        return {
            items,
            page: listFileRequestDto.page,
            totalItems: result.total,
            totalPages: Math.ceil(result.total / 10)
        };
    }

    public async deleteFile(user: LoggedUserInterface, id: number): Promise<void> {
        try {
            const file = await this.fileRepository.findOne({ where: { id, userId: user.id } });

            if (!file) {
                throw new Error("Arquivo não encontrado.");
            }

            await this.fileRepository.delete(id, { where: { userId: user.id } });

            await this.minioFileService.delete(file.path);

            await this.qdrantService.deleteByFilter(user.id, file.id);
        } catch (error) {
            throw new Error(`Erro ao deletar o arquivo: ${error?.message || "Erro desconhecido"}`);
        }
    }

    public async get(user: LoggedUserInterface, id: number): Promise<GetFileResponseDto> {
        const file = await this.fileRepository.findOne({ where: { id, userId: user.id } });

        if (!file) {
            throw new Error("Arquivo não encontrado.");
        }

        const url = await this.minioFileService.getUrl(file.path);

        const fileDto = plainToInstance(
            GetFileResponseDto,
            {
                ...file,
                url
            },
            { excludeExtraneousValues: true }
        );

        return fileDto;
    }
}

