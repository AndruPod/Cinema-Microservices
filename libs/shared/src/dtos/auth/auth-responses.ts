import { Role } from "../../auth/role.enum";

export interface PublicUser {
    id: number;
    email: string;
    role: Role;
    createdAt: Date;
}

export interface AccessToken {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: string;
}
