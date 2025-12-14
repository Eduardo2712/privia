import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/is-public.decorator";
import { UserService } from "../../modules/user/user.service";
import { AuthService } from "../../modules/auth/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly userService: UserService,
        private readonly authService: AuthService
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
            const payload = await this.authService.validateToken(token);

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

