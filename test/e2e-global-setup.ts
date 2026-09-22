import { Client } from "pg";
import { applyE2eEnv, E2E_ENV } from "./e2e-env";

/** Recreates empty e2e databases; each service migrates its own on startup. */
export default async function globalSetup(): Promise<void> {
    applyE2eEnv();

    const client = new Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: "postgres",
    });
    await client.connect();

    try {
        for (const database of [
            E2E_ENV.USERS_DB_NAME,
            E2E_ENV.CATALOG_DB_NAME,
            E2E_ENV.ORDER_DB_NAME,
        ]) {
            await client.query(
                `DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`,
            );
            await client.query(`CREATE DATABASE "${database}"`);
        }
    } finally {
        await client.end();
    }
}
