import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();

        try {
            const cookieHeader = client.handshake.headers?.cookie;
            let token: string | undefined;

            if (cookieHeader && typeof cookieHeader === "string") {
                const regex = /privia-token=([^;]+)/;
                const match = regex.exec(cookieHeader);

                if (match) {
                    token = decodeURIComponent(match[1]);
                }
            }

            if (!token) {
                const auth = client.handshake.auth;
                const headerAuth = client.handshake.headers?.authorization;
                const rawToken = (auth && (typeof auth === "object" ? (auth.token ?? auth) : auth)) || headerAuth;

                if (rawToken && typeof rawToken === "string") {
                    token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
                }
            }

            if (!token) {
                throw new UnauthorizedException("Token não encontrado");
            }

            const decoded = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });

            client.data.user = decoded;

            return true;
        } catch {
            throw new UnauthorizedException("Token inválido ou expirado");
        }
    }
}

