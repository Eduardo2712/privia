import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { AiModule } from "../ai/ai.module";
import { QdrantModule } from "../qdrant/qdrant.module";
import { BullModule } from "@nestjs/bullmq";
import { ProcessFileProcessor } from "./processors/process-file.processor";
import { CommonModule } from "../../common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./repositories/file.entity";
import { FileRepository } from "./repositories/file.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";
import { MinioFileService } from "./minio-file.service";
import { ChunkerFileService } from "./chunker-file.service";
import { SocketModule } from "../socket/socket.module";
import { MessageModule } from "../message/message.module";

@Module({
    controllers: [FileController],
    providers: [FileService, ProcessFileProcessor, FileRepository, MinioFileService, ChunkerFileService],
    exports: [FileService],
    imports: [
        AiModule,
        QdrantModule,
        SocketModule,
        MessageModule,
        BullModule.registerQueue({ name: "process-file" }),
        CommonModule,
        TypeOrmModule.forFeature([FileEntity]),
        NestMinioModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                endPoint: configService.get<string>("MINIO_END_POINT", "localhost"),
                port: configService.get<number>("MINIO_PORT", 9000),
                useSSL: false,
                accessKey: configService.get<string>("MINIO_ACCESS_KEY"),
                secretKey: configService.get<string>("MINIO_SECRET_KEY")
            }),
            inject: [ConfigService]
        })
    ]
})
export class FileModule {}

