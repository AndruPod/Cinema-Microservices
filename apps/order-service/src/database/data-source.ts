import "dotenv/config";
import { DataSource } from "typeorm";
import {
    connectionFromEnv,
    postgresOptions,
} from "@app/shared/database/postgres.config";
import { Order } from "../entities/order.entity";
import { orderMigrations } from "./migrations";

// Used by the TypeORM CLI (see "migration:*" scripts in package.json).
export default new DataSource(
    postgresOptions(
        connectionFromEnv("ORDER_DB_NAME"),
        [Order],
        orderMigrations,
    ),
);
