import { ConnectedSocket, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import { UseGuards, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_ORIGIN || true, credentials: true } })
@UseGuards(WsJwtGuard)
export class SocketGateway implements OnGatewayInit {
    private readonly logger = new Logger(SocketGateway.name);

    constructor(private readonly jwtService: JwtService) {}

    @WebSocketServer()
    server: Server;

    async afterInit(server: Server): Promise<void> {
        this.server = server;

        server.use(async (socket: Socket, next) => {
            try {
                const cookieHeader = socket.handshake.headers?.cookie;
                let token: string | undefined;

                if (cookieHeader && typeof cookieHeader === "string") {
                    const regex = /privia-token=([^;]+)/;
                    const match = regex.exec(cookieHeader);

                    if (match) {
                        token = decodeURIComponent(match[1]);
                    }
                }

                if (!token) {
                    const auth = socket.handshake.auth;
                    const headerAuth = socket.handshake.headers?.authorization;
                    const rawToken = (auth && (typeof auth === "object" ? (auth.token ?? auth) : auth)) || headerAuth;

                    if (rawToken && typeof rawToken === "string") {
                        token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
                    }
                }

                if (!token) {
                    return next(new Error("Não autorizado"));
                }

                const decoded = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });

                socket.data.user = decoded;

                return next();
            } catch (err) {
                this.logger.warn(`Socket auth failed: ${err?.message || err}`);

                return next(new Error("Não autorizado"));
            }
        });
    }

    @SubscribeMessage("join")
    async handleJoin(@ConnectedSocket() client: Socket): Promise<void> {
        client.join(client.data.user.id);
    }
}

