import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { LoginRequestDto } from "./dto/login-request.dto";
import { Public } from "../../common/decorators/is-public.decorator";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { maxAgeToken } from "../../common/utils/config.util";
import { LoginResponseDto } from "./dto/login-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post("/login")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: LoginResponseDto })
    async login(@Body() loginRequestDto: LoginRequestDto, @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
        const { token, user } = await this.authService.login(loginRequestDto);

        res.cookie("privia-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: maxAgeToken * 1000
        });

        return { user };
    }

    @Public()
    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
        res.clearCookie("privia-token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        });
    }

    @Public()
    @Post("/forgot-password")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: void 0 })
    async forgot(@Body() forgotPasswordRequestDto: ForgotPasswordRequestDto): Promise<void> {
        return await this.authService.forgotPassword(forgotPasswordRequestDto);
    }
}

