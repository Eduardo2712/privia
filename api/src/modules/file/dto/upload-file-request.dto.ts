import { ApiProperty } from "@nestjs/swagger";

export class UploadFileRequestDto {
    @ApiProperty({ type: "string", format: "binary" })
    // Aqui era any antes:
    file!: Express.Multer.File;
}

