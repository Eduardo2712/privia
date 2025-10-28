import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { LoginRequestDto } from "./dto/login-request.dto";
import { AuthInterface } from "./interfaces/auth.interface";
import { Public } from "../../common/decorators/is-public.decorator";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { ApiOkResponse } from "@nestjs/swagger";
import { maxAgeToken } from "../../common/utils/config.util";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post("/login")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: LoginRequestDto })
    async login(@Body() loginRequestDto: LoginRequestDto, @Res({ passthrough: true }) res: Response): Promise<{ user: AuthInterface["user"] }> {
        const { token, user } = await this.authService.login(loginRequestDto);

        res.cookie("privia-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: maxAgeToken
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
    public async forgot(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }
}

