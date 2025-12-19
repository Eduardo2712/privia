import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { MessageTypeEnum } from "../enums/message.enum";

export class MessageSourceResponseDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: "Texto do trecho utilizado" })
    @Expose()
    text: string;

    @ApiProperty({ example: 1 })
    @Expose()
    sourceIndex: number;
}

export class MessageResponseDto {
    @ApiProperty({ example: 42 })
    @Expose()
    id: number;

    @ApiProperty({ example: 10 })
    @Expose()
    fileId: number;

    @ApiProperty({ example: 5 })
    @Expose()
    userId: number;

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

