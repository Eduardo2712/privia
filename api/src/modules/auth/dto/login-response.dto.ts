import { ApiProperty } from "@nestjs/swagger";

class UserLoginResponseDto {
    @ApiProperty({ example: "user@email.com", type: String })
    email: string;

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
    @ApiProperty({ type: UserLoginResponseDto })
    user: UserLoginResponseDto;

    static fromEntity(data: { user: { email: string; name: string } }): LoginResponseDto {
        const dto = new LoginResponseDto();

        dto.user = UserLoginResponseDto.fromEntity(data.user);

        return dto;
    }
}

