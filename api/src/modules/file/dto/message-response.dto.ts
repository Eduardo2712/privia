import { ApiProperty } from "@nestjs/swagger";
import { MessageTypeEnum } from "../../message/enums/message.enum";

export class MessageResponseDto {
    @ApiProperty({ example: 1, type: Number })
    id: number;

    @ApiProperty({ example: MessageTypeEnum.AI, enum: MessageTypeEnum })
    type: MessageTypeEnum;

    @ApiProperty({ example: "This is a message content", type: String })
    content: string;

    @ApiProperty({ example: "2024-01-01T12:00:00Z", type: String, format: "date-time" })
    createdAt: Date;

    @ApiProperty({ example: "2024-01-01T12:05:00Z", type: String, format: "date-time" })
    updatedAt: Date;

    @ApiProperty({ example: null, type: String, format: "date-time", nullable: true })
    deletedAt?: Date | null;
}
