import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

class MessageSourceItemDto {
    @ApiProperty({ example: "Texto do trecho utilizado" })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    index: number;
}

export class SaveAiResponseRequestDto {
    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    fileId: number;

    @ApiProperty({ example: 25 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    userMessageId: number;

    @ApiProperty({ example: "Resposta gerada pela IA" })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ type: [MessageSourceItemDto], required: false, default: [] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageSourceItemDto)
    @IsOptional()
    sources?: MessageSourceItemDto[];
}

export { MessageSourceItemDto };

