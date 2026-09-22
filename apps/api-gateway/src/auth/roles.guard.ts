import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    SetMetadata,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@app/shared/auth/role.enum";
import { AuthenticatedRequest } from "./authenticated-request";

const ROLES_KEY = "roles";

/** Restricts a route to the given roles. Use together with JwtAuthGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<
            Role[] | undefined
        >(ROLES_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredRoles?.length) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        if (!user) throw new UnauthorizedException();
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException("Insufficient permissions");
        }

        return true;
    }
}
