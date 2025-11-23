import { ApiProperty } from "@nestjs/swagger";

class FileResponseDto {
    @ApiProperty({ example: 1, type: Number })
    id: number;

    @ApiProperty({ example: "file-name.pdf", type: String })
    name: string;

    @ApiProperty({ example: "https://example.com/file-name.pdf", type: String })
    url: string;
}

export class ListFileResponseDto {
    @ApiProperty({ example: 1, type: Number })
    page: number;

    @ApiProperty({ example: 10, type: Number })
    totalPages: number;

    @ApiProperty({ example: 100, type: Number })
    totalItems: number;

    @ApiProperty({ example: [{ id: 1, name: "file-name.pdf", url: "https://example.com/file-name.pdf" }], type: [FileResponseDto] })
    items: Array<FileResponseDto>;
}

