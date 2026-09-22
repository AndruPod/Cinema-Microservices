import {
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthUser, Role } from "@app/shared/auth/role.enum";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);

    const contextFor = (user?: AuthUser) =>
        ({
            getHandler: () => undefined,
            getClass: () => undefined,
            switchToHttp: () => ({ getRequest: () => ({ user }) }),
        }) as unknown as ExecutionContext;

    const requireRoles = (roles?: Role[]) =>
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);

    const admin: AuthUser = { id: 1, email: "a@x.io", role: Role.ADMIN };
    const user: AuthUser = { id: 2, email: "u@x.io", role: Role.USER };

    it("allows any request when no role is required", () => {
        requireRoles(undefined);

        expect(guard.canActivate(contextFor())).toBe(true);
    });

    it("allows a user with the required role", () => {
        requireRoles([Role.ADMIN]);

        expect(guard.canActivate(contextFor(admin))).toBe(true);
    });

    it("forbids a user without the required role", () => {
        requireRoles([Role.ADMIN]);

        expect(() => guard.canActivate(contextFor(user))).toThrow(
            ForbiddenException,
        );
    });

    it("rejects an unauthenticated request on a role-protected route", () => {
        requireRoles([Role.ADMIN]);

        expect(() => guard.canActivate(contextFor())).toThrow(
            UnauthorizedException,
        );
    });
});
