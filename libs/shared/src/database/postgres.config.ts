import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export interface PostgresConnection {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

/**
 * Common TypeORM options for every service database.
 * Schema changes are applied only through migrations, which run on startup.
 */
export function postgresOptions(
    connection: PostgresConnection,
    entities: PostgresConnectionOptions["entities"],
    migrations: PostgresConnectionOptions["migrations"],
): PostgresConnectionOptions {
    return {
        type: "postgres",
        ...connection,
        entities,
        migrations,
        migrationsRun: true,
        synchronize: false,
    };
}

/** Connection settings for the TypeORM CLI, read from `.env` / process env. */
export function connectionFromEnv(
    databaseNameVariable: string,
): PostgresConnection {
    const required = (name: string): string => {
        const value = process.env[name];
        if (!value) throw new Error(`Missing environment variable ${name}`);
        return value;
    };

    return {
        host: required("DB_HOST"),
        port: Number(process.env.DB_PORT ?? 5432),
        username: required("DB_USER"),
        password: required("DB_PASSWORD"),
        database: required(databaseNameVariable),
    };
}
