import { Module } from "@nestjs/common";
import { AuthServiceController } from "./auth-service.controller";
import { AuthServiceService } from "./auth-service.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get<string>("DB_HOST"),
                port: configService.get<number>("DB_PORT"),
                username: configService.get<string>("DB_USER"),
                password: configService.get<string>("DB_PASSWORD"),
                database: configService.get<string>("CATALOG_DB_NAME"),
                entities: [User],
                synchronize: true,
                autoLoadEntities: true,
            }),
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: "10m"
            }
        })
    ],
    controllers: [AuthServiceController],
    providers: [AuthServiceService],
})
export class AuthServiceModule {}
