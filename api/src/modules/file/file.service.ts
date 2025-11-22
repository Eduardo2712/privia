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

@Injectable()
export class FileService {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService,
        private readonly minioFileService: MinioFileService,
        private readonly chunkerFileService: ChunkerFileService,
        @InjectQueue("process-file") private readonly processFileQueue: Queue<ProcessFileJob>
    ) {}

    public async readFile(user: LoggedUserInterface, file: Express.Multer.File): Promise<void> {
        if (!file?.buffer) {
            throw new Error("O buffer de arquivos enviados está vazio.");
        }

        const text = file.buffer.toString("utf-8");

        const chunks = this.chunkerFileService.chunkText({ text });

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        const newFile = await this.minioFileService.create(file);

        await this.processFileQueue.add("process-file", new ProcessFileJob(chunks, file, user, newFile));
    }

    public async searchFileStream(user: LoggedUserInterface, searchFileDto: SearchFileRequestDto): Promise<SearchFileStreamResponseInterface> {
        const startTime = Date.now();

        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Erro ao gerar embedding para a busca.");
        }

        const documentId = 1; // FAZER
        const searchResults = await this.qdrantService.search(user, documentId, "files", queryEmbedding);

        if (searchResults.length === 0) {
            const emptyIterator: AsyncIterable<string> = {
                async *[Symbol.asyncIterator]() {
                    yield "Informação não encontrada nos trechos.";
                }
            };

            return { stream: emptyIterator, references: [], timeInMs: Date.now() - startTime };
        }

        const stream = await this.aiService.generateResponseStream(searchResults, searchFileDto.search);

        const references = searchResults.map((r, i) => ({ text: r.text, index: i + 1 }));

        return { stream, references, timeInMs: Date.now() - startTime };
    }
}

