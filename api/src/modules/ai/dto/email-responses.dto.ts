import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class EmailResponsesDto {
    @ApiProperty({ example: 1, type: Number })
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    emailId: number;
}

