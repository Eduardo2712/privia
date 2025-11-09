import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileService } from "./file.service";
import { Public } from "../../common/decorators/is-public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "../../common/pipe/file-validation-size.pipe";
import { FileTypeValidationPipe } from "../../common/pipe/file-validation-type.pipe";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UploadFileRequestDto } from "./dto/upload-file-request.dto";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { SearchFileResponseDto } from "./dto/search-file-response.dto";

@ApiTags("file")
@Controller("file")
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Public()
    @Post("/read")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: UploadFileRequestDto })
    @ApiOkResponse({ type: void 0 })
    async readFile(@UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe()) file: Express.Multer.File): Promise<void> {
        return await this.fileService.readFile(file);
    }

    @Public()
    @Post("/search")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: SearchFileResponseDto })
    async searchFile(@Body() searchFileDto: SearchFileRequestDto): Promise<SearchFileResponseDto> {
        return await this.fileService.searchFile(searchFileDto);
    }
}

