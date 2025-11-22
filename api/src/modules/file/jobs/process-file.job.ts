import { LoggedUserInterface } from "../../../common/interfaces/jwt.interface";
import { FileEntity } from "../entities/file.entity";

export class ProcessFileJob {
    constructor(
        public readonly chunks: string[],
        public readonly file: Express.Multer.File,
        public readonly user: LoggedUserInterface,
        public readonly fileEntity: FileEntity
    ) {}
}

