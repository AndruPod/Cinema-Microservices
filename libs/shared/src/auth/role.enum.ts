export enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
}

/** User identity extracted from a verified JWT. */
export interface AuthUser {
    id: number;
    email: string;
    role: Role;
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: Role;
}
