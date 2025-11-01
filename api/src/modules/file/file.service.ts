import { Injectable } from "@nestjs/common";

@Injectable()
export class FileService {
    constructor() {}

    public async uploadFile(file: Express.Multer.File): Promise<void> {}
}

