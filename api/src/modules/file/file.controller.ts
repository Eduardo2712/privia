import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors, Res } from "@nestjs/common";
import { Response } from "express";
import { FileService } from "./file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "../../common/pipe/file-validation-size.pipe";
import { FileTypeValidationPipe } from "../../common/pipe/file-validation-type.pipe";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UploadFileRequestDto } from "./dto/upload-file-request.dto";
import { SearchFileRequestDto } from "./dto/search-file-request.dto";
import { SearchFileResponseDto } from "./dto/search-file-response.dto";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { GetUser } from "../../common/decorators/get-user.decorator";

@ApiTags("file")
@Controller("file")
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post("/read")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: UploadFileRequestDto })
    @ApiOkResponse({ type: void 0 })
    async readFile(
        @GetUser() user: LoggedUserInterface,
        @UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe()) file: Express.Multer.File
    ): Promise<void> {
        return await this.fileService.readFile(user, file);
    }

    @Post("/search")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: SearchFileResponseDto, isArray: true })
    async searchFile(@GetUser() user: LoggedUserInterface, @Body() searchFileDto: SearchFileRequestDto, @Res() res: Response): Promise<void> {
        try {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Accel-Buffering", "no");

            const { stream, references, timeInMs } = await this.fileService.searchFileStream(user, searchFileDto);

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
            }

            res.write(`data: ${JSON.stringify({ type: "references", references })}\n\n`);
            res.write(`data: ${JSON.stringify({ type: "timeInMs", timeInMs })}\n\n`);
            res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);

            res.end();
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ message: error?.message || "Erro ao processar busca" });
            } else {
                res.write(`data: ${JSON.stringify({ type: "error", message: error?.message || "Erro" })}\n\n`);
                res.end();
            }
        }
    }
}

