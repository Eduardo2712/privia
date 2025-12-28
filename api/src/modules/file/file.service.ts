import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../qdrant/qdrant.service";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { ChunkerFileService } from "./chunker-file.service";
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
import { GetLastestMessagesResponseDto } from "./dto/get-lastest-messages-response.dto";

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

    public async readFile(userId: number, file: Express.Multer.File): Promise<ReadFileResponseDto> {
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
            userId
        });

        await this.processFileQueue.add("process-file", new ProcessFileJob(chunks, file, userId, newFile, text));

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

    public async searchFileStream(userId: number, searchFileDto: SearchFileRequestDto): Promise<SearchFileStreamResponseInterface> {
        const file = await this.fileRepository.findOne({ where: { id: searchFileDto.documentId, userId } });

        if (!file) {
            throw new Error("Arquivo não encontrado.");
        }

        await this.fileRepository.update(file.id, {
            lastInteractionAt: new Date(),
            suggestedQuestions: []
        });

        const documentId = searchFileDto.documentId;

        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);
        const searchResults = await this.qdrantService.search(userId, documentId, queryEmbedding);

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
                        fileId: documentId,
                        type: MessageTypeEnum.USER,
                        userId
                    })
            );

            return {
                stream: emptyIterator
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
                    fileId: documentId,
                    type: MessageTypeEnum.USER,
                    userId
                })
        );

        const wrappedStream = this.createStreamWithAutoSave(stream, userId, documentId, userMessage.id, references);

        return {
            stream: wrappedStream
        };
    }

    private async *createStreamWithAutoSave(
        sourceStream: AsyncIterable<string>,
        userId: number,
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
            await this.messageService.saveAiResponse(userId, {
                fileId,
                userMessageId,
                content: accumulatedResponse,
                sources: references
            });
        }
    }

    public async list(userId: number, listFileRequestDto: ListFileRequestDto): Promise<ListFileResponseDto> {
        const result = await this.fileRepository.listByUser(userId, listFileRequestDto);

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

    public async deleteFile(userId: number, id: number): Promise<void> {
        const file = await this.fileRepository.findOne({ where: { id, userId } });

        if (!file) {
            throw new Error("Arquivo não encontrado.");
        }

        await this.fileRepository.delete(id, { where: { userId } });

        await this.minioFileService.delete(file.path);

        await this.qdrantService.deleteByFilter(userId, file.id);
    }

    public async get(userId: number, id: number): Promise<GetFileResponseDto> {
        const file = await this.fileRepository.findWithMessages(id, userId);

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

    public async getLastestMessages(userId: number, id: number): Promise<GetLastestMessagesResponseDto[]> {
        const lastMessage = await this.messageService.getLastestMessagesByFileId(userId, id);

        if (!lastMessage || lastMessage.length === 0) {
            throw new Error("Nenhuma mensagem encontrada para este arquivo.");
        }

        return plainToInstance(GetLastestMessagesResponseDto, lastMessage, { excludeExtraneousValues: true });
    }
}

