import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

class UserLoginResponseDto {
    @Expose()
    @ApiProperty({ example: "user@email.com", type: String })
    email: string;

    @Expose()
    @ApiProperty({ example: "John Doe", type: String })
    name: string;

    static fromEntity(user: { email: string; name: string }): UserLoginResponseDto {
        const dto = new UserLoginResponseDto();

        dto.email = user.email;
        dto.name = user.name;

        return dto;
    }
}

export class LoginResponseDto {
    @Expose()
    @ApiProperty({ type: UserLoginResponseDto })
    user: UserLoginResponseDto;

    static fromEntity(data: { user: { email: string; name: string } }): LoginResponseDto {
        const dto = new LoginResponseDto();

        dto.user = UserLoginResponseDto.fromEntity(data.user);

        return dto;
    }
}

