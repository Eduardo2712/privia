import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileService } from "./file.service";
import { Public } from "../../common/decorators/is-public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "../../common/pipe/file-validation-size.pipe";

@Controller("file")
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Public()
    @Post("/upload")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor("file"))
    async uploadFile(@UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File): Promise<void> {
        return await this.fileService.uploadFile(file);
    }
}

