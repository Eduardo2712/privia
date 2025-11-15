import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { AiModule } from "../ai/ai.module";
import { QdrantModule } from "../../infrastructure/qdrant/qdrant.module";
import { BullModule } from "@nestjs/bullmq";
import { ProcessFileProcessor } from "./processors/process-file.processor";
import { CommonModule } from "../../common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./entities/file.entity";
import { FileRepository } from "./entities/file.repository";

@Module({
    controllers: [FileController],
    providers: [FileService, ProcessFileProcessor, FileRepository],
    exports: [FileService],
    imports: [AiModule, QdrantModule, BullModule.registerQueue({ name: "process-file" }), CommonModule, TypeOrmModule.forFeature([FileEntity])]
})
export class FileModule {}

