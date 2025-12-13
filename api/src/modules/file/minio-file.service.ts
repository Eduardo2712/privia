import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from "minio";
import { getPathFile } from "../../common/utils/functions.util";

@Injectable()
export class MinioFileService {
    constructor(@Inject(MINIO_CONNECTION) private readonly minioClient: Client) {}

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
            const url = await this.minioClient.presignedUrl("GET", process.env.MINIO_BUCKET_NAME as string, path);

            return url;
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }

    public async delete(path: string): Promise<void> {
        try {
            await this.minioClient.removeObject(process.env.MINIO_BUCKET_NAME as string, path);
        } catch (err) {
            throw new InternalServerErrorException(err ?? "Erro");
        }
    }
}

