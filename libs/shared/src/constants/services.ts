export enum Services {
    CATALOG = "CATALOG_SERVICE",
    ORDER = "ORDER_SERVICE",
    AUTH = "AUTH_SERVICE",
}

export enum CatalogPatterns {
    GET_ALL_MOVIES = "get_movies",
    GET_ONE_MOVIE = "get_one_movie",
    CREATE_MOVIE = "create_movie",
}

export enum OrderPatterns {
    GET_ALL_USER_ORDERS = "get_user_orders",
    GET_ONE_USER_ORDER = "get_one_user_order",
    CREATE_ORDER = "create_order",
}

export enum AuthPatterns {
    REGISTER = "register",
    LOGIN = "login",
    LOGOUT = "logout",
}
