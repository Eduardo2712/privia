import { ApiProperty } from "@nestjs/swagger";
import { FileResponseDto } from "./file-response.dto";
import { Expose } from "class-transformer";

export class ListFileResponseDto {
    @Expose()
    @ApiProperty({ example: 1, type: Number })
    page: number;

    @Expose()
    @ApiProperty({ example: 10, type: Number })
    totalPages: number;

    @Expose()
    @ApiProperty({ example: 100, type: Number })
    totalItems: number;

    @Expose()
    @ApiProperty({
        example: <FileResponseDto[]>[
            {
                id: 1,
                name: "file-name.pdf",
                url: "https://example.com/file-name.pdf",
                size: 1024,
                mimeType: "application/pdf",
                summary: "This is a summary of the file.",
                suggestedQuestions: ["What is the summary?", "What are the key points?", "How to use this document?"],
                isProcessed: true,
                createdAt: new Date("2024-01-01T12:00:00Z"),
                updatedAt: new Date("2024-01-02T12:00:00Z")
            }
        ],
        type: [FileResponseDto]
    })
    items: Array<FileResponseDto>;
}

