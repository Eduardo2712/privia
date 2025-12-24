import { FileEntity } from "../repositories/file.entity";

export class ProcessFileJob {
    constructor(
        public readonly chunks: string[],
        public readonly file: Express.Multer.File,
        public readonly userId: number,
        public readonly fileEntity: FileEntity,
        public readonly text: string
    ) {}
}

