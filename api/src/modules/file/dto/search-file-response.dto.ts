import { ApiProperty } from "@nestjs/swagger";

export class SearchFileReferenceDto<T> {
    @ApiProperty({ description: "chunk", type: String })
    type: string;

    @ApiProperty({ description: "", type: String })
    T: string;
}

export class SearchFileResponseDto<T> {
    @ApiProperty({
        description: "References to the sources used in the response",
        type: () => SearchFileReferenceDto<T>,
        isArray: true
    })
    data: SearchFileReferenceDto<T>[];
}

