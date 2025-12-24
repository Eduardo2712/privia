import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { MessageResponseDto } from "../../message/dto/message-response.dto";
import { ListMessageResponseDto } from "../../message/dto/list-message-response.dto";

export class FileResponseDto {
    @Expose()
    @ApiProperty({ example: 1, type: Number })
    id: number;

    @Expose()
    @ApiProperty({ example: "file-name.pdf", type: String })
    name: string;

    @Expose()
    @ApiProperty({ example: "https://example.com/file-name.pdf", type: String })
    url: string;

    @Expose()
    @ApiProperty({ example: 1024, type: Number })
    size: number;

    @Expose()
    @ApiProperty({ example: "application/pdf", type: String })
    mimeType: string;

    @Expose()
    @ApiProperty({ example: "This is a summary of the file.", type: String })
    summary: string;

    @Expose()
    @ApiProperty({ example: "This is the content of the file.", type: String })
    content: string;

    @Expose()
    @ApiProperty({ example: true, type: Boolean })
    isProcessed: boolean;

    @Expose()
    @ApiProperty({ example: ["What is the summary?", "What are the key points?", "How to use this document?"], type: [String] })
    suggestedQuestions?: string[];

    @Expose()
    @Type(() => ListMessageResponseDto)
    @ApiProperty({
        example: [
            {
                page: 1,
                totalPages: 1,
                totalItems: 2,
                items: [
                    {
                        id: 1,
                        type: "AI",
                        content: "This is a message content",
                        createdAt: new Date("2024-01-01T12:00:00Z")
                    },
                    {
                        id: 2,
                        type: "USER",
                        content: "This is another message content",
                        createdAt: new Date("2024-01-01T12:05:00Z")
                    }
                ]
            }
        ],
        type: [ListMessageResponseDto]
    })
    messages: ListMessageResponseDto[];

    @Expose()
    @ApiProperty({ example: "2024-01-01T12:00:00Z", type: String, format: "date-time" })
    createdAt: Date;

    @Expose()
    @ApiProperty({ example: "2024-01-02T12:00:00Z", type: String, format: "date-time" })
    updatedAt: Date;
}

