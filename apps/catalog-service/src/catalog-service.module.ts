import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createEnvValidator } from "@app/shared/config/env.validation";
import { postgresOptions } from "@app/shared/database/postgres.config";
import { DatabaseHealthController } from "@app/shared/rpc/health.controller";
import { CatalogEnv } from "./config/catalog.env";
import { catalogMigrations } from "./database/migrations";
import { Movie } from "./entities/movie.entity";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: createEnvValidator(CatalogEnv),
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
                        database: config.getOrThrow("CATALOG_DB_NAME"),
                    },
                    [Movie],
                    catalogMigrations,
                ),
        }),
        TypeOrmModule.forFeature([Movie]),
    ],
    controllers: [MoviesController, DatabaseHealthController],
    providers: [MoviesService],
})
export class CatalogServiceModule {}
