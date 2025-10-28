export interface ErrorResponseInterface {
    statusCode: number;
    timestamp: string;
    path: string;
    message: string | string[];
    error?: string;
}

