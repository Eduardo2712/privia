import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateUserEmailDto {
    @ApiProperty({ example: "user@email.com", type: String })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "imap.email.com", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    imapHost: string;

    @ApiProperty({ example: 993, type: Number })
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    imapPort: number;

    @ApiProperty({ example: "smtp.email.com", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    smtpHost: string;

    @ApiProperty({ example: 587, type: Number })
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    smtpPort: number;

    @ApiProperty({ example: "username", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    username: string;

    @ApiProperty({ example: "password123", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    password: string;
}

