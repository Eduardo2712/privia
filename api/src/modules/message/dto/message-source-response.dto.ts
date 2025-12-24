import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

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
