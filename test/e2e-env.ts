import "dotenv/config";

/**
 * Environment for the e2e suite. Every service runs in the Jest process on
 * its own ports and database, so a running `docker compose` stack or local
 * dev databases are never touched. Database credentials (DB_HOST, DB_PORT,
 * DB_USER, DB_PASSWORD) come from the shell or `.env`.
 */
export const E2E_ENV = {
    USERS_DB_NAME: "cinema_e2e_users",
    CATALOG_DB_NAME: "cinema_e2e_catalog",
    ORDER_DB_NAME: "cinema_e2e_orders",
    AUTH_SERVICE_HOST: "127.0.0.1",
    AUTH_SERVICE_LISTEN_HOST: "127.0.0.1",
    AUTH_SERVICE_PORT: "43103",
    CATALOG_SERVICE_HOST: "127.0.0.1",
    CATALOG_SERVICE_LISTEN_HOST: "127.0.0.1",
    CATALOG_SERVICE_PORT: "43101",
    ORDER_SERVICE_HOST: "127.0.0.1",
    ORDER_SERVICE_LISTEN_HOST: "127.0.0.1",
    ORDER_SERVICE_PORT: "43102",
    JWT_SECRET: "e2e-only-secret-that-is-at-least-32-characters-long",
    JWT_EXPIRES_IN: "15m",
    ADMIN_EMAIL: "admin@e2e.test",
    ADMIN_PASSWORD: "AdminPass123!",
    RPC_TIMEOUT_MS: "5000",
};

export function applyE2eEnv(): void {
    Object.assign(process.env, E2E_ENV);
}
