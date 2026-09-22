import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createEnvValidator } from "@app/shared/config/env.validation";
import { Services } from "@app/shared/constants/services";
import { postgresOptions } from "@app/shared/database/postgres.config";
import { rpcClientProvider } from "@app/shared/rpc/rpc-client";
import { DatabaseHealthController } from "@app/shared/rpc/health.controller";
import { OrderEnv } from "./config/order.env";
import { orderMigrations } from "./database/migrations";
import { Order } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: createEnvValidator(OrderEnv),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                postgresOptions(
                    {
                        host: config.getOrThrow("DB_HOST"),
                        port: config.getOrThrow("DB_PORT"),
                        username: config.getOrThrow("DB_USER"),
                        password: config.getOrThrow("DB_PASSWORD"),
                        database: config.getOrThrow("ORDER_DB_NAME"),
                    },
                    [Order],
                    orderMigrations,
                ),
        }),
        TypeOrmModule.forFeature([Order]),
    ],
    controllers: [OrdersController, DatabaseHealthController],
    providers: [OrdersService, rpcClientProvider(Services.CATALOG)],
})
export class OrderServiceModule {}
