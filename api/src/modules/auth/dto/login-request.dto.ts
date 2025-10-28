import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginRequestDto {
    @ApiProperty({ example: "user@email.com", type: String })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "password123", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    password: string;
}

