import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "@app/shared/auth/role.enum";
import { AuthenticatedRequest } from "./authenticated-request";

/** Injects the user attached by JwtAuthGuard. */
export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
        context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
