import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from "minio";
import { FileEntity } from "./entities/file.entity";
import { FileRepository } from "./entities/file.repository";
import { fileName } from "../../common/utils/functions.util";

@Injectable()
export class MinioFileService {
    constructor(
        private readonly fileRepository: FileRepository,
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) {}

    private urlCache = new Map<string, { url: string; expiresAt: number }>();
    private DEFAULT_EXPIRY = 3600;

    public async create(file: Express.Multer.File): Promise<FileEntity> {
        try {
            const objectName = fileName(file.originalname);

            await this.minioClient.putObject(process.env.MINIO_BUCKET_NAME as string, objectName, file.buffer, file.size, {
                "Content-Type": file.mimetype
            });

            const obj = await this.fileRepository.create({
                path: objectName,
                name: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            });

            return obj;
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }

    public async getUrl(fileName: string): Promise<string> {
        try {
            const now = Date.now();
            const cached = this.urlCache.get(fileName);

            if (cached && now < cached.expiresAt) {
                return cached.url;
            }

            const expiryInSeconds = this.DEFAULT_EXPIRY;
            const url = await this.minioClient.presignedUrl("GET", process.env.MINIO_BUCKET_NAME as string, fileName, expiryInSeconds);

            this.urlCache.set(fileName, {
                url,
                expiresAt: now + expiryInSeconds * 1000
            });

            return url;
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }

    public async delete(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(process.env.MINIO_BUCKET_NAME as string, fileName);
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }
}

