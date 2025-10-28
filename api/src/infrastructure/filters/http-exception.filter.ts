import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponseInterface } from "../../common/interfaces/filter.interface";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { status, message, error } = this.extractErrorInfo(exception);

        this.logError(request, status, message, exception);

        const errorResponse: ErrorResponseInterface = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            ...(error && { error })
        };

        response.status(status).json(errorResponse);
    }

    private extractErrorInfo(exception: unknown): {
        status: number;
        message: string;
        error?: string;
    } {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (typeof response === "object" && response !== null) {
                const responseObj = response as {
                    message: string;
                    error?: string;
                };

                return {
                    status: exception.getStatus(),
                    message: responseObj.message ?? exception.message,
                    error: responseObj.error
                };
            }

            return {
                status: exception.getStatus(),
                message: exception.message
            };
        }

        if (exception instanceof Error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Erro interno do servidor"
            };
        }

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Serviço indisponível"
        };
    }

    private logError(request: Request, status: number, message: string, exception: unknown): void {
        const errorMessage = Array.isArray(message) ? message.join(", ") : message;
        const logMessage = `${request.method} ${request.url} ${status} - ${errorMessage}`;

        if (status >= 500) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        } else {
            this.logger.warn(logMessage);
        }
    }
}

