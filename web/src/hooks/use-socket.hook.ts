import { useEffect, useState, useRef } from "react";
import { getSocket } from "../lib/socket";

export default function useSocket() {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

    useEffect(() => {
        if (globalThis.window === undefined) {
            return;
        }

        socketRef.current ??= getSocket();

        const socket = socketRef.current;

        if (!socket) {
            return;
        }

        socket.connect();

        const onConnect = () => {
            setConnected(true);
            socket.emit("join");
        };

        const onDisconnect = () => setConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
        };
    }, []);

    return { socket: socketRef.current, connected };
}
