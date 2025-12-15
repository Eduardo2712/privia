export interface ServerToClientEvents {
    "file:processed": (data: { id: number }) => void;
}

export interface ClientToServerEvents {}
