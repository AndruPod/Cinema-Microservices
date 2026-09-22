import "dotenv/config";
import { DataSource } from "typeorm";
import {
    connectionFromEnv,
    postgresOptions,
} from "@app/shared/database/postgres.config";
import { User } from "../entities/user.entity";
import { authMigrations } from "./migrations";

// Used by the TypeORM CLI (see "migration:*" scripts in package.json).
export default new DataSource(
    postgresOptions(connectionFromEnv("USERS_DB_NAME"), [User], authMigrations),
);
