import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ListFileRequestDto {
    @ApiProperty({ example: 1, type: Number })
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    page: number;

    @ApiProperty({ example: "Text to search", type: String, required: false })
    @IsString()
    @IsOptional()
    search?: string;
}

