import { LoggedUserInterface } from "../../../common/interfaces/jwt.interface";

export class ProcessFileJob {
    constructor(
        public readonly chunks: string[],
        public readonly file: Express.Multer.File,
        public readonly user: LoggedUserInterface
    ) {}
}

