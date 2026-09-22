import {
    INestMicroservice,
    Logger,
    Type,
    ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AsyncMicroserviceOptions, Transport } from "@nestjs/microservices";
import { SERVICE_ENDPOINTS, Services } from "../constants/services";
import { LoggingInterceptor } from "../interceptors/logging.interceptor";
import { RpcExceptionsFilter } from "./rpc-exceptions.filter";

/** Global pipes, filters and interceptors shared by every microservice. */
export function configureMicroservice(app: INestMicroservice): void {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(new RpcExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.enableShutdownHooks();
}

/**
 * Creates a TCP microservice whose host/port come from the validated config,
 * applies the shared configuration and starts listening.
 */
export async function bootstrapMicroservice(
    module: Type<unknown>,
    service: Services,
): Promise<INestMicroservice> {
    const endpoint = SERVICE_ENDPOINTS[service];

    const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
        module,
        {
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: Transport.TCP,
                options: {
                    host: config.get<string>(endpoint.listenHost, "0.0.0.0"),
                    port: config.getOrThrow<number>(endpoint.port),
                },
            }),
        },
    );

    configureMicroservice(app);
    await app.listen();

    const port = app.get(ConfigService).get<number>(endpoint.port);
    new Logger("Bootstrap").log(`${service} listening on TCP port ${port}`);

    return app;
}
