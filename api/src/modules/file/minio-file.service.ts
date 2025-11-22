import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from "minio";
import { FileEntity } from "./entities/file.entity";
import { FileRepository } from "./entities/file.repository";

@Injectable()
export class MinioFileService {
    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: FileRepository,
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) {}

    private urlCache = new Map<string, { url: string; expiresAt: number }>();
    private DEFAULT_EXPIRY = 3600;

    public async create(file: Express.Multer.File): Promise<FileEntity> {
        try {
            await this.minioClient.fPutObject(process.env.MINIO_BUCKET_NAME as string, file.path, file.originalname);

            const obj = await this.fileRepository.create({
                path: file.path,
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

