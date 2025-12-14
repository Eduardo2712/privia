import { io } from "socket.io-client";

export function getSocket() {
    return io(process.env.NEXT_PUBLIC_URL_SOCKET, {
        withCredentials: true,
        autoConnect: false,
    });
}
