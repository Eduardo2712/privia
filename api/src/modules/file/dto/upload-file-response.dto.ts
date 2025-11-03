import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UploadFileResponseDto {
    @ApiProperty({ description: "Original filename provided by the client" })
    originalName!: string;

    @ApiProperty({ description: "Stored filename (can differ from original)" })
    fileName!: string;

    @ApiProperty({ description: "MIME type of the uploaded file" })
    mimeType!: string;

    @ApiProperty({ description: "Size of the file in bytes" })
    size!: number;

    @ApiPropertyOptional({ description: "Public URL to access the file if available", nullable: true })
    url?: string | null;
}

