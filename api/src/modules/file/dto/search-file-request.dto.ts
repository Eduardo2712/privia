import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SearchFileRequestDto {
    @ApiProperty({ example: "Text to search", type: String })
    @IsNotEmpty()
    @IsString()
    search: string;

    @ApiProperty({ example: 5, type: Number })
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    documentId: number;
}

