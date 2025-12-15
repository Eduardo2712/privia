import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@shared/socket-types";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function getSocket(): TypedSocket {
    return io(process.env.NEXT_PUBLIC_URL_SOCKET, {
        withCredentials: true,
        autoConnect: false,
    });
}
