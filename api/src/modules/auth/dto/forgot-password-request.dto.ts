import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordRequestDto {
    @ApiProperty({ example: "user@email.com", type: String })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

