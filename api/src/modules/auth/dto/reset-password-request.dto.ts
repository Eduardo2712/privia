import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength, Validate, ValidateIf, ValidationArguments } from "class-validator";
import { passwordRegex } from "../../../common/utils/validate.util";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordRequestDto {
    @ApiProperty({ example: "password123", type: String })
    @IsString()
    @MinLength(6)
    @MaxLength(30)
    @IsNotEmpty()
    @Validate(
        (value: string, args: ValidationArguments) => {
            const object = args.object as ResetPasswordRequestDto;

            return passwordRegex.test(value) && value === object.password;
        },
        { message: "Confirmação de senha inválida" }
    )
    @ValidateIf((o: ResetPasswordRequestDto) => o.step === 2)
    password: string;

    @ApiProperty({ example: "password123", type: String })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(30)
    @Validate(
        (value: string, args: ValidationArguments) => {
            const object = args.object as ResetPasswordRequestDto;

            return passwordRegex.test(value) || value !== object.password;
        },
        { message: "Confirmação de senha inválida" }
    )
    @ValidateIf((o: ResetPasswordRequestDto) => o.step === 2)
    password_confirmation: string;

    @ApiProperty({ example: "123456", type: String })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 1, description: "1 - Enviar código | 2 - Redefinir senha", type: Number })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(2)
    step: number;
}

