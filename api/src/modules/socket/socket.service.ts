import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ServerToClientEventsInterface } from "./interfaces/socket.interface";
import { Server } from "socket.io";

@Injectable()
export class SocketService {
    private server: Server;

    public setServer(server: Server): void {
        this.server = server;
    }

    public authenticateSocket(cookieHeader: string, auth: { token?: string }, headerAuth: string): string {
        let token: string | undefined;

        if (cookieHeader && typeof cookieHeader === "string") {
            const regex = /privia-token=([^;]+)/;
            const match = regex.exec(cookieHeader);

            if (match) {
                token = decodeURIComponent(match[1]);
            }
        }

        if (!token) {
            const rawToken = (auth && (typeof auth === "object" ? (auth.token ?? auth) : auth)) || headerAuth;

            if (rawToken && typeof rawToken === "string") {
                token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
            }
        }

        if (!token) {
            throw new UnauthorizedException("Token não encontrado");
        }

        return token;
    }

    public emitToUser<E extends keyof ServerToClientEventsInterface>(userId: number, event: E, payload: ServerToClientEventsInterface[E]): void {
        this.server.to(`user-${userId}`).emit(event, payload);
    }
}

