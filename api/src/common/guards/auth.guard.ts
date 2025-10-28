import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/is-public.decorator";
import { JWTUserInterface } from "../interfaces/jwt.interface";
import { UserService } from "../../modules/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookie(request);

        if (!token) {
            throw new UnauthorizedException("Token não encontrado");
        }

        try {
            const payload: JWTUserInterface = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>("JWT_SECRET")
            });

            const user = await this.userService.findOneById(payload.sub);

            if (!payload || !user) {
                throw new UnauthorizedException("Token inválido");
            }

            request.user = user;
        } catch {
            throw new UnauthorizedException("Token inválido");
        }

        return true;
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.["privia-token"];
    }
}

