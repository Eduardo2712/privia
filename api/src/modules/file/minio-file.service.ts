import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from "minio";
import { getPathFile } from "../../common/utils/functions.util";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class MinioFileService {
    constructor(
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    protected getCacheKey(path: string): string {
        return `minio_file_url_${path}`;
    }

    public async create(file: Express.Multer.File): Promise<string> {
        try {
            const objectName = getPathFile(file.originalname);

            await this.minioClient.putObject(process.env.MINIO_BUCKET_NAME as string, objectName, file.buffer, file.size, {
                "Content-Type": file.mimetype
            });

            return objectName;
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }

    public async getUrl(path: string): Promise<string> {
        try {
            const cacheKey = this.getCacheKey(path);

            const cached = await this.cacheManager.get<string>(cacheKey);

            if (cached) {
                return cached;
            }

            const url = await this.minioClient.presignedUrl("GET", process.env.MINIO_BUCKET_NAME as string, path);

            await this.cacheManager.set(cacheKey, url, 300);

            return url;
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }

    public async delete(path: string): Promise<void> {
        try {
            await this.minioClient.removeObject(process.env.MINIO_BUCKET_NAME as string, path);

            const cacheKey = this.getCacheKey(path);

            await this.cacheManager.del(cacheKey);
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }
}

