import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { passwordRegex, phoneRegex } from "../../../common/utils/validate.util";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: "John Doe", type: String })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: "user@email.com", type: String })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "(99) 99999-9999", type: String })
    @IsNotEmpty()
    @IsString()
    @Validate((value: string) => phoneRegex.test(value))
    phone: string;

    @ApiProperty({ example: "password123", type: String })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(30)
    @Validate((value: string) => passwordRegex.test(value))
    password: string;

    @ApiProperty({ example: "password123", type: String })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(30)
    @Validate((value: string) => passwordRegex.test(value))
    confirmPassword: string;
}

