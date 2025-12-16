export interface ServerToClientEventsInterface {
    "file:processed": { id: number };
    "file:progress": { id: number; progress: number };
}

export interface ServerToClientEvents {
    "file:processed": (data: ServerToClientEventsInterface["file:processed"]) => void;
    "file:progress": (data: ServerToClientEventsInterface["file:progress"]) => void;
}

export interface ClientToServerEvents {
    [event: string]: never;
}

