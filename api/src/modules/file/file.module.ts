import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { AiModule } from "../ai/ai.module";
import { QdrantModule } from "../../infrastructure/qdrant/qdrant.module";

@Module({
    controllers: [FileController],
    providers: [FileService],
    exports: [FileService],
    imports: [AiModule, QdrantModule]
})
export class FileModule {}

