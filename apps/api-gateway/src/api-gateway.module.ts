import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ApiGatewayController } from "./api-gateway.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Services } from "@app/shared/constants/services";
import { AppLoggerMiddleware } from "./logger.middleware";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ClientsModule.registerAsync([
            {
                name: Services.CATALOG,
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host:
                            configService.get<string>(
                                "CATALOG_SERVICE_DOCKER_HOST",
                            ) || "catalog-service",
                        port:
                            configService.get<number>("CATALOG_SERVICE_PORT") ||
                            3001,
                    },
                }),
            },
            {
                name: Services.ORDER,
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host:
                            configService.get<string>(
                                "ORDER_SERVICE_DOCKER_HOST",
                            ) || "order-service",
                        port:
                            configService.get<number>("ORDER_SERVICE_PORT") ||
                            3002,
                    },
                }),
            },
            {
                name: Services.AUTH,
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host:
                            configService.get<string>(
                                "AUTH_SERVICE_DOCKER_HOST",
                            ) || "auth-service",
                        port:
                            configService.get<number>("AUTH_SERVICE_PORT") ||
                            3003,
                    },
                }),
            },
        ]),
    ],
    controllers: [ApiGatewayController],
})
export class ApiGatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppLoggerMiddleware).forRoutes("*");
    }
}
