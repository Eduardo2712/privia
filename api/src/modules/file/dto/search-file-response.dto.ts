import { ApiProperty } from "@nestjs/swagger";

export class SearchFileResponseDto {
    @ApiProperty({ description: "The AI-generated response based on the search query", type: String })
    response: string;
}

