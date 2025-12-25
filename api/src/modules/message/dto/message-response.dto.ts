import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { MessageTypeEnum } from "../enums/message.enum";
import { MessageSourceResponseDto } from "./message-source-response.dto";

export class MessageResponseDto {
    @Expose()
    @ApiProperty({ example: 42 })
    id: number;

    @Expose()
    @ApiProperty({ enum: MessageTypeEnum, example: MessageTypeEnum.AI })
    type: MessageTypeEnum;

    @Expose()
    @ApiProperty({ example: "Resposta gerada pela IA" })
    content: string;

    @Expose()
    @ApiProperty({ type: [MessageSourceResponseDto] })
    @Type(() => MessageSourceResponseDto)
    sources?: MessageSourceResponseDto[];

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    createdAt?: Date;
}

