import { ConnectedSocket, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import { UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { SocketService } from "./socket.service";
import { AuthService } from "../auth/auth.service";

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_ORIGIN || true, credentials: true } })
@UseGuards(WsJwtGuard)
export class SocketGateway implements OnGatewayInit {
    constructor(
        private readonly socketService: SocketService,
        private readonly authService: AuthService
    ) {}

    @WebSocketServer()
    server: Server;

    async afterInit(server: Server): Promise<void> {
        this.server = server;
        this.socketService.setServer(server);

        server.use(async (socket: Socket, next) => {
            try {
                const token = this.socketService.authenticateSocket(
                    socket.handshake.headers?.cookie || "",
                    socket.handshake.auth,
                    socket.handshake.headers?.authorization || ""
                );

                const decoded = await this.authService.validateToken(token);

                socket.data.user = decoded;

                return next();
            } catch {
                return next(new Error("Não autorizado"));
            }
        });
    }

    @SubscribeMessage("join")
    async handleJoin(@ConnectedSocket() client: Socket): Promise<void> {
        client.join(client.data.user.id);
    }
}

