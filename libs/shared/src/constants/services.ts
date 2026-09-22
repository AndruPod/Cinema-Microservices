export enum Services {
    AUTH = "AUTH_SERVICE",
    CATALOG = "CATALOG_SERVICE",
    ORDER = "ORDER_SERVICE",
}

/**
 * Environment variables used to reach each microservice over TCP.
 * `host` is the address clients connect to, `listenHost` is the interface
 * the microservice itself binds to.
 */
export const SERVICE_ENDPOINTS: Record<
    Services,
    { host: string; listenHost: string; port: string }
> = {
    [Services.AUTH]: {
        host: "AUTH_SERVICE_HOST",
        listenHost: "AUTH_SERVICE_LISTEN_HOST",
        port: "AUTH_SERVICE_PORT",
    },
    [Services.CATALOG]: {
        host: "CATALOG_SERVICE_HOST",
        listenHost: "CATALOG_SERVICE_LISTEN_HOST",
        port: "CATALOG_SERVICE_PORT",
    },
    [Services.ORDER]: {
        host: "ORDER_SERVICE_HOST",
        listenHost: "ORDER_SERVICE_LISTEN_HOST",
        port: "ORDER_SERVICE_PORT",
    },
};

export const DEFAULT_RPC_TIMEOUT_MS = 5000;

export enum CommonPatterns {
    HEALTH = "health.check",
}

export enum AuthPatterns {
    REGISTER = "auth.register",
    LOGIN = "auth.login",
    GET_PROFILE = "auth.get_profile",
}

export enum CatalogPatterns {
    FIND_ALL_MOVIES = "catalog.movies.find_all",
    FIND_ONE_MOVIE = "catalog.movies.find_one",
    CREATE_MOVIE = "catalog.movies.create",
    UPDATE_MOVIE = "catalog.movies.update",
    DELETE_MOVIE = "catalog.movies.delete",
}

export enum OrderPatterns {
    CREATE_ORDER = "orders.create",
    FIND_USER_ORDERS = "orders.find_by_user",
    FIND_USER_ORDER = "orders.find_one_by_user",
    CANCEL_USER_ORDER = "orders.cancel",
}
