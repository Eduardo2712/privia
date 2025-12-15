import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Server } from "socket.io";
import { ServerToClientEvents } from "./interfaces/socket.interface";

type ClientToServerEvents = {
    [k: string]: (...args: unknown[]) => void;
};

@Injectable()
export class SocketService {
    private server?: Server<ClientToServerEvents, ServerToClientEvents>;

    public setServer(server: Server<ClientToServerEvents, ServerToClientEvents>): void {
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
            throw new UnauthorizedException("Token não encontrado");
        }

        const rawToken = (auth && (typeof auth === "object" ? (auth.token ?? auth) : auth)) || headerAuth;

        if (rawToken && typeof rawToken === "string") {
            token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
        }

        return token;
    }

    public emitToUser<E extends keyof ServerToClientEvents>(userId: number, event: E, payload: Parameters<ServerToClientEvents[E]>): void {
        if (!this.server) {
            return;
        }

        this.server.to(`user-${userId}`).emit(event, ...payload);
    }
}

