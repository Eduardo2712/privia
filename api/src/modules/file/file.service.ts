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
import { MessageService } from "../message/message.service";
import { MessageTypeEnum } from "../message/enums/message.enum";
import { UnitOfWorkService } from "../../common/unity-of-work.service";

@Injectable()
export class FileService {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService,
        private readonly minioFileService: MinioFileService,
        private readonly chunkerFileService: ChunkerFileService,
        private readonly fileRepository: FileRepository,
        private readonly messageService: MessageService,
        private readonly unitOfWork: UnitOfWorkService,
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
            content: text,
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
        const documentId = searchFileDto.documentId;
        const searchResults = await this.qdrantService.search(user, documentId, queryEmbedding);

        if (searchResults.length === 0) {
            const emptyIterator: AsyncIterable<string> = {
                async *[Symbol.asyncIterator]() {
                    yield "Informação não encontrada nos trechos.";
                }
            };

            await this.unitOfWork.withTransaction(
                async () =>
                    await this.messageService.createWithSources({
                        content: searchFileDto.search,
                        userId: user.id,
                        fileId: documentId,
                        type: MessageTypeEnum.USER
                    })
            );

            return {
                stream: emptyIterator,
                references: [],
                timeInMs: Date.now() - startTime
            };
        }

        const rerankedChunks = this.chunkerFileService.rerankHybrid(searchResults, searchFileDto.search);
        const topChunks = this.chunkerFileService.topChunks(rerankedChunks);
        const stream = await this.aiService.generateResponseStream(topChunks, searchFileDto.search);
        const references = topChunks.map((r, i) => ({ text: r.text, index: i + 1 }));

        const userMessage = await this.unitOfWork.withTransaction(
            async () =>
                await this.messageService.createWithSources({
                    content: searchFileDto.search,
                    userId: user.id,
                    fileId: documentId,
                    type: MessageTypeEnum.USER
                })
        );

        const wrappedStream = this.createStreamWithAutoSave(stream, user, documentId, userMessage.id, references);

        return {
            stream: wrappedStream,
            references,
            timeInMs: Date.now() - startTime
        };
    }

    private async *createStreamWithAutoSave(
        sourceStream: AsyncIterable<string>,
        user: LoggedUserInterface,
        fileId: number,
        userMessageId: number,
        references: Array<{ text: string; index: number }>
    ): AsyncIterable<string> {
        let accumulatedResponse = "";

        for await (const chunk of sourceStream) {
            accumulatedResponse += chunk;

            yield chunk;
        }

        if (accumulatedResponse.trim()) {
            await this.messageService.saveAiResponse(user, {
                fileId,
                userMessageId,
                content: accumulatedResponse,
                sources: references
            });
        }
    }

    public async list(user: LoggedUserInterface, listFileRequestDto: ListFileRequestDto): Promise<ListFileResponseDto> {
        const result = await this.fileRepository.listFilesByUser(user.id, listFileRequestDto);

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
        const file = await this.fileRepository.findOne({ where: { id, userId: user.id } });

        if (!file) {
            throw new Error("Arquivo não encontrado.");
        }

        await this.fileRepository.delete(id, { where: { userId: user.id } });

        await this.minioFileService.delete(file.path);

        await this.qdrantService.deleteByFilter(user.id, file.id);
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

