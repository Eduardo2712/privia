export class FileReadEvent {
    constructor(
        public readonly chunks: string[],
        public readonly file: Express.Multer.File
    ) {}
}

