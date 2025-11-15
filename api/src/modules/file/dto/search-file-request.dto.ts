import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchFileRequestDto {
    @ApiProperty({ example: "Text to search", type: String })
    @IsNotEmpty()
    @IsString()
    search: string;
}

