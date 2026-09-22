import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@app/shared/auth/role.enum";
import { AuthenticatedRequest } from "./authenticated-request";
import { JwtAuthGuard } from "./jwt-auth.guard";

const SECRET = "unit-test-secret-with-at-least-32-chars";

describe("JwtAuthGuard", () => {
    const jwtService = new JwtService({ secret: SECRET });
    const guard = new JwtAuthGuard(jwtService);

    const contextFor = (authorization?: string) => {
        const request = { headers: { authorization } } as AuthenticatedRequest;
        const context = {
            switchToHttp: () => ({ getRequest: () => request }),
        } as ExecutionContext;
        return { request, context };
    };

    it("attaches the verified user to the request", async () => {
        const token = await jwtService.signAsync({
            sub: 5,
            email: "jane@example.com",
            role: Role.USER,
        });
        const { request, context } = contextFor(`Bearer ${token}`);

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(request.user).toEqual({
            id: 5,
            email: "jane@example.com",
            role: Role.USER,
        });
    });

    it.each([
        ["no header", undefined],
        ["a non-Bearer scheme", "Basic abc"],
        ["an empty token", "Bearer "],
    ])("rejects a request with %s", async (_case, header) => {
        await expect(
            guard.canActivate(contextFor(header).context),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rejects a token signed with another secret", async () => {
        const forged = await new JwtService({
            secret: "another-secret-with-at-least-32-characters",
        }).signAsync({ sub: 5, email: "x@example.com", role: Role.ADMIN });

        await expect(
            guard.canActivate(contextFor(`Bearer ${forged}`).context),
        ).rejects.toThrow(
            new UnauthorizedException("Invalid or expired token"),
        );
    });

    it("rejects an expired token", async () => {
        const expired = await jwtService.signAsync(
            { sub: 5, email: "jane@example.com", role: Role.USER },
            { expiresIn: -10 },
        );

        await expect(
            guard.canActivate(contextFor(`Bearer ${expired}`).context),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rejects a token with an unknown role", async () => {
        const token = await jwtService.signAsync({
            sub: 5,
            email: "jane@example.com",
            role: "SUPERUSER",
        });

        await expect(
            guard.canActivate(contextFor(`Bearer ${token}`).context),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
