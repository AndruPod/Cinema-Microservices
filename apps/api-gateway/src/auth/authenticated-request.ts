import { Request } from "express";
import { AuthUser } from "@app/shared/auth/role.enum";

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
