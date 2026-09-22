import {
    BadGatewayException,
    GatewayTimeoutException,
    HttpException,
    Logger,
    OnApplicationShutdown,
    Provider,
    ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from "@nestjs/microservices";
import { firstValueFrom, timeout, TimeoutError } from "rxjs";
import {
    DEFAULT_RPC_TIMEOUT_MS,
    SERVICE_ENDPOINTS,
    Services,
} from "../constants/services";
import { isRpcErrorPayload } from "./rpc-error";

const CONNECTION_ERROR_CODES = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENOTFOUND",
    "EPIPE",
]);

/**
 * Thin wrapper around a TCP {@link ClientProxy}: applies a timeout to every
 * request and turns transport and downstream errors into HTTP exceptions, so
 * callers can simply `await` a response.
 */
export class RpcClient implements OnApplicationShutdown {
    private readonly logger: Logger;

    constructor(
        private readonly proxy: ClientProxy,
        private readonly service: Services,
        private readonly timeoutMs: number = DEFAULT_RPC_TIMEOUT_MS,
    ) {
        this.logger = new Logger(`RpcClient:${service}`);
    }

    async send<TResult, TPayload = unknown>(
        pattern: string,
        payload: TPayload,
    ): Promise<TResult> {
        try {
            return await firstValueFrom(
                this.proxy
                    .send<TResult, TPayload>(pattern, payload)
                    .pipe(timeout(this.timeoutMs)),
            );
        } catch (error) {
            throw this.toHttpException(error, pattern);
        }
    }

    onApplicationShutdown(): Promise<void> {
        return this.proxy.close() as Promise<void>;
    }

    private toHttpException(error: unknown, pattern: string): HttpException {
        if (isRpcErrorPayload(error)) {
            return new HttpException(
                {
                    statusCode: error.statusCode,
                    message: error.message,
                    error: error.error,
                },
                error.statusCode,
            );
        }

        if (error instanceof TimeoutError) {
            this.logger.warn(
                `"${pattern}" timed out after ${this.timeoutMs}ms`,
            );
            return new GatewayTimeoutException(
                `${this.service} did not respond in time`,
            );
        }

        const code = (error as { code?: string } | null)?.code;
        if (code && CONNECTION_ERROR_CODES.has(code)) {
            this.logger.error(`"${pattern}" failed: ${code}`);
            return new ServiceUnavailableException(
                `${this.service} is unavailable`,
            );
        }

        this.logger.error(`"${pattern}" failed`, error as Error);
        return new BadGatewayException(
            `Unexpected response from ${this.service}`,
        );
    }
}

/** Registers an {@link RpcClient} for the given service under its token. */
export function rpcClientProvider(service: Services): Provider {
    return {
        provide: service,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
            const endpoint = SERVICE_ENDPOINTS[service];
            const proxy = ClientProxyFactory.create({
                transport: Transport.TCP,
                options: {
                    host: config.getOrThrow<string>(endpoint.host),
                    port: config.getOrThrow<number>(endpoint.port),
                },
            });

            return new RpcClient(
                proxy,
                service,
                config.get<number>("RPC_TIMEOUT_MS"),
            );
        },
    };
}
