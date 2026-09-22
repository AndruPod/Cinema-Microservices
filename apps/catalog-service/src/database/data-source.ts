import "dotenv/config";
import { DataSource } from "typeorm";
import {
    connectionFromEnv,
    postgresOptions,
} from "@app/shared/database/postgres.config";
import { Movie } from "../entities/movie.entity";
import { catalogMigrations } from "./migrations";

// Used by the TypeORM CLI (see "migration:*" scripts in package.json).
export default new DataSource(
    postgresOptions(
        connectionFromEnv("CATALOG_DB_NAME"),
        [Movie],
        catalogMigrations,
    ),
);
