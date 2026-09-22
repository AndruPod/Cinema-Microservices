import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { createEnvValidator } from "@app/shared/config/env.validation";
import { Services } from "@app/shared/constants/services";
import { rpcClientProvider } from "@app/shared/rpc/rpc-client";
import { AuthController } from "./auth/auth.controller";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { AppLoggerMiddleware } from "./common/logger.middleware";
import { GatewayEnv } from "./config/gateway.env";
import { HealthController } from "./health/health.controller";
import { MoviesController } from "./movies/movies.controller";
import { OrdersController } from "./orders/orders.controller";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: createEnvValidator(GatewayEnv),
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>("JWT_SECRET"),
                verifyOptions: { algorithms: ["HS256"] },
            }),
        }),
    ],
    controllers: [
        AuthController,
        MoviesController,
        OrdersController,
        HealthController,
    ],
    providers: [
        rpcClientProvider(Services.AUTH),
        rpcClientProvider(Services.CATALOG),
        rpcClientProvider(Services.ORDER),
        JwtAuthGuard,
        RolesGuard,
    ],
})
export class ApiGatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppLoggerMiddleware).forRoutes("{*splat}");
    }
}
