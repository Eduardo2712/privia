import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../entities/user.entity";
import { Exclude } from "class-transformer";

export class UserResponseDto implements UserEntity {
    @ApiProperty({ example: 1, type: Number })
    id: number;

    @ApiProperty({ example: "John Doe", type: String })
    name: string;

    @ApiProperty({ example: "john.doe@example.com", type: String })
    email: string;

    @ApiProperty({ example: "(42) 01234-5678", type: String })
    phone: string;

    @Exclude()
    password: string;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z", type: String, format: "date-time" })
    createdAt?: Date;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z", type: String, format: "date-time" })
    updatedAt?: Date;

    @ApiPropertyOptional({ example: null, type: String, format: "date-time", nullable: true })
    deletedAt?: Date;

    static fromEntity(entity: UserEntity): UserResponseDto {
        const dto = new UserResponseDto();

        dto.id = entity.id;
        dto.name = entity.name;
        dto.email = entity.email;
        dto.phone = entity.phone;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        dto.deletedAt = entity.deletedAt ?? undefined;

        return dto;
    }
}

