import { ApiProperty } from "@nestjs/swagger";

export class SearchFileReferenceDto {
    @ApiProperty({ description: "Referenced text snippet", type: String })
    text: string;

    @ApiProperty({ description: "Index of the reference in the source", type: Number })
    index: number;
}

export class SearchFileResponseDto {
    @ApiProperty({ description: "The AI-generated response based on the search query", type: String })
    response: string;

    @ApiProperty({
        description: "References to the sources used in the response",
        type: () => SearchFileReferenceDto,
        isArray: true
    })
    references: SearchFileReferenceDto[];
}

