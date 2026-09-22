import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createEnvValidator } from "@app/shared/config/env.validation";
import { postgresOptions } from "@app/shared/database/postgres.config";
import { DatabaseHealthController } from "@app/shared/rpc/health.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthEnv } from "./config/auth.env";
import { authMigrations } from "./database/migrations";
import { User } from "./entities/user.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: createEnvValidator(AuthEnv),
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
                        database: config.getOrThrow("USERS_DB_NAME"),
                    },
                    [User],
                    authMigrations,
                ),
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: config.getOrThrow("JWT_EXPIRES_IN"),
                },
            }),
        }),
    ],
    controllers: [AuthController, DatabaseHealthController],
    providers: [AuthService],
})
export class AuthServiceModule {}
