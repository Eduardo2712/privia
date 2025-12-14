import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Socket } from "socket.io";
import { SocketService } from "../socket.service";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private readonly socketService: SocketService,
        private readonly authService: AuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();

        try {
            const token = this.socketService.authenticateSocket(
                client.handshake.headers?.cookie || "",
                client.handshake.auth,
                client.handshake.headers?.authorization || ""
            );

            const decoded = await this.authService.validateToken(token);

            client.data.user = decoded;

            return true;
        } catch {
            throw new UnauthorizedException("Token inválido ou expirado");
        }
    }
}

