import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../interfaces/socket.interface";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function getSocket(): TypedSocket {
    return io(globalThis.window === undefined ? process.env.INTERNAL_URL_API_SOCKET : process.env.NEXT_PUBLIC_URL_SOCKET, {
        withCredentials: true,
        autoConnect: false,
    });
}
