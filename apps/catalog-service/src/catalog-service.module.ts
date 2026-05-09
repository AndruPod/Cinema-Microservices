import { Module } from "@nestjs/common";
import { CatalogServiceController } from "./catalog-service.controller";
import { CatalogServiceService } from "./catalog-service.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Movie } from "./entities/movie.entity";

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
                entities: [Movie],
                synchronize: true,
                autoLoadEntities: true,
            }),
        }),
        TypeOrmModule.forFeature([Movie]),
    ],
    controllers: [CatalogServiceController],
    providers: [CatalogServiceService],
})
export class CatalogServiceModule {}
