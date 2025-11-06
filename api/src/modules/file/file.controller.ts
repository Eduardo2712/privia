import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileService } from "./file.service";
import { Public } from "../../common/decorators/is-public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "../../common/pipe/file-validation-size.pipe";
import { FileTypeValidationPipe } from "../../common/pipe/file-validation-type.pipe";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UploadFileRequestDto } from "./dto/upload-file-request.dto";

@ApiTags("file")
@Controller("file")
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Public()
    @Post("/upload")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: UploadFileRequestDto })
    @ApiOkResponse({ type: void 0 })
    async uploadFile(@UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe()) file: Express.Multer.File): Promise<void> {
        return await this.fileService.uploadFile(file);
    }

    @Public()
    @Post("/search")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: void 0 })
    async searchFile(): Promise<void> {}
}

