import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { AiModule } from "../ai/ai.module";
import { QdrantModule } from "../../infrastructure/qdrant/qdrant.module";
import { FileReadListener } from "./listeners/file-read.listener";

@Module({
    controllers: [FileController],
    providers: [FileService, FileReadListener],
    exports: [FileService],
    imports: [AiModule, QdrantModule]
})
export class FileModule {}

