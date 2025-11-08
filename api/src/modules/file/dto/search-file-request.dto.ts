import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchFileRequestDto {
    @ApiProperty({ example: "<search_text>", type: String })
    @IsNotEmpty()
    @IsString()
    search: string;
}

