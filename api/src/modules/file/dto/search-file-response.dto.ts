import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

enum SearchFileChunkType {
    CHUNK = "chunk"
}

export class SearchFileReferenceDto<T> {
    @Expose()
    @ApiProperty({ description: "Type of search result", enum: SearchFileChunkType, enumName: "SearchFileChunkType" })
    type: SearchFileChunkType;

    @Expose()
    @ApiProperty({ description: "", type: String })
    T: string;
}

export class SearchFileResponseDto<T> {
    @Expose()
    @ApiProperty({
        description: "References to the sources used in the response",
        type: () => SearchFileReferenceDto<T>,
        isArray: true
    })
    data: SearchFileReferenceDto<T>[];
}

