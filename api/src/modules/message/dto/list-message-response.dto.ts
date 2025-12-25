import { ApiProperty } from "@nestjs/swagger";
import { MessageResponseDto } from "./message-response.dto";
import { MessageTypeEnum } from "../enums/message.enum";
import { Expose } from "class-transformer";

export class ListMessageResponseDto {
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
        example: <MessageResponseDto[]>[
            {
                id: 1,
                type: MessageTypeEnum.AI,
                content: "This is a message content",
                createdAt: new Date("2024-01-01T12:00:00Z")
            }
        ],
        type: [MessageResponseDto]
    })
    items: Array<MessageResponseDto>;
}

