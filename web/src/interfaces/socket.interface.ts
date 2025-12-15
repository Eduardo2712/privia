export interface ServerToClientEventsInterface {
    "file:processed": {
        id: number;
        summary: string;
    };
}

export interface ServerToClientEvents {
    "file:processed": (data: { id: number }) => void;
}

export interface ClientToServerEvents {
    [event: string]: never;
}
