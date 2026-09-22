import { HttpException, HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { QueryFailedError } from "typeorm";

/** Error shape every microservice sends back to its callers. */
export interface RpcErrorPayload {
    statusCode: number;
    message: string | string[];
    error: string;
}

const PG_UNIQUE_VIOLATION = "23505";

export function isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as RpcErrorPayload).statusCode === "number" &&
        "message" in value
    );
}

/** Normalizes anything thrown inside a microservice handler. */
export function toRpcErrorPayload(exception: unknown): RpcErrorPayload {
    if (exception instanceof HttpException) {
        const statusCode = exception.getStatus();
        const response = exception.getResponse();

        if (typeof response === "string") {
            return { statusCode, message: response, error: exception.name };
        }

        const body = response as Partial<RpcErrorPayload>;
        return {
            statusCode,
            message: body.message ?? exception.message,
            error: body.error ?? exception.name,
        };
    }

    if (exception instanceof RpcException) {
        const error = exception.getError();
        if (isRpcErrorPayload(error)) return error;

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: typeof error === "string" ? error : exception.message,
            error: "Internal Server Error",
        };
    }

    if (
        exception instanceof QueryFailedError &&
        (exception.driverError as { code?: string })?.code ===
            PG_UNIQUE_VIOLATION
    ) {
        return {
            statusCode: HttpStatus.CONFLICT,
            message: "Resource already exists",
            error: "Conflict",
        };
    }

    return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        error: "Internal Server Error",
    };
}
