import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class MessageSourceResponseDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: "Texto do trecho utilizado" })
    text: string;

    @Expose()
    @ApiProperty({ example: 1 })
    sourceIndex: number;
}

