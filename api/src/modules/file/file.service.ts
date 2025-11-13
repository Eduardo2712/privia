import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { QdrantService } from "../../infrastructure/qdrant/qdrant.service";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { SearchFileResponseDto } from "./dto/search-file-response.dto";
import { BaseFileService } from "./base-file.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileReadEvent } from "./events/file-read.event";

@Injectable()
export class FileService extends BaseFileService {
    constructor(
        private readonly aiService: AiService,
        private readonly qdrantService: QdrantService,
        private readonly eventEmitter: EventEmitter2
    ) {
        super();
    }

    public async readFile(file: Express.Multer.File): Promise<void> {
        if (!file?.buffer) {
            throw new Error("O buffer de arquivos enviados está vazio.");
        }

        const text = file.buffer.toString("utf-8");

        const chunks = this.chunkTextSmartRobust(text);

        if (!chunks) {
            throw new Error("Falha ao dividir o arquivo em partes.");
        }

        this.eventEmitter.emit("file.read", new FileReadEvent(chunks, file));
    }

    public async searchFile(searchFileDto: SearchFileRequestDto): Promise<SearchFileResponseDto> {
        const queryEmbedding = await this.aiService.getEmbedding(searchFileDto.search);

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Erro ao gerar embedding para a busca.");
        }

        const searchResults = await this.qdrantService.search("files", queryEmbedding);

        if (searchResults.length === 0) {
            return { response: "A informação solicitada não foi encontrada nos documentos fornecidos." };
        }

        const combinedText = searchResults.map((r) => r.text).join("\n\n");

        const response = await this.aiService.generateResponse(combinedText, searchFileDto.search);

        return { response };
    }
}

