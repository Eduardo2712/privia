import { ApiProperty } from "@nestjs/swagger";
import { FileResponseDto } from "./file-response.dto";

export class ListFileResponseDto {
    @ApiProperty({ example: 1, type: Number })
    page: number;

    @ApiProperty({ example: 10, type: Number })
    totalPages: number;

    @ApiProperty({ example: 100, type: Number })
    totalItems: number;

    @ApiProperty({
        example: <FileResponseDto[]>[
            {
                id: 1,
                name: "file-name.pdf",
                url: "https://example.com/file-name.pdf",
                size: 1024,
                mimeType: "application/pdf",
                summary: "This is a summary of the file.",
                createdAt: new Date("2024-01-01T12:00:00Z"),
                updatedAt: new Date("2024-01-02T12:00:00Z")
            }
        ],
        type: [FileResponseDto]
    })
    items: Array<FileResponseDto>;
}

