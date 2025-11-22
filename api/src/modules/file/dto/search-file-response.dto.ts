import { ApiProperty } from "@nestjs/swagger";

enum SearchFileChunkType {
    CHUNK = "chunk",
    REFERENCE = "reference",
    TIME_IN_MS = "timeInMs"
}

export class SearchFileReferenceDto<T> {
    @ApiProperty({ description: "Type of search result", enum: SearchFileChunkType, enumName: "SearchFileChunkType" })
    type: SearchFileChunkType;

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

