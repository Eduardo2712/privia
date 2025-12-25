import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UploadFileResponseDto {
    @Expose()
    @ApiProperty({ description: "Original filename provided by the client" })
    originalName!: string;

    @Expose()
    @ApiProperty({ description: "Stored filename (can differ from original)" })
    fileName!: string;

    @Expose()
    @ApiProperty({ description: "MIME type of the uploaded file" })
    mimeType!: string;

    @Expose()
    @ApiProperty({ description: "Size of the file in bytes" })
    size!: number;

    @Expose()
    @ApiPropertyOptional({ description: "Public URL to access the file if available", nullable: true })
    url?: string | null;
}

