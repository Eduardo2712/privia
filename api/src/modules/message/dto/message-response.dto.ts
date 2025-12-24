import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { MessageTypeEnum } from "../enums/message.enum";
import { MessageSourceResponseDto } from "./message-source-response.dto";

export class MessageResponseDto {
    @ApiProperty({ example: 42 })
    @Expose()
    id: number;

    @ApiProperty({ enum: MessageTypeEnum, example: MessageTypeEnum.AI })
    @Expose()
    type: MessageTypeEnum;

    @ApiProperty({ example: "Resposta gerada pela IA" })
    @Expose()
    content: string;

    @ApiProperty({ type: [MessageSourceResponseDto] })
    @Expose()
    @Type(() => MessageSourceResponseDto)
    sources?: MessageSourceResponseDto[];

    @ApiProperty({ example: new Date().toISOString() })
    @Expose()
    createdAt?: Date;
}

