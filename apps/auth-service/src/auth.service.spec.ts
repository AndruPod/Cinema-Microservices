import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { JwtPayload, Role } from "@app/shared/auth/role.enum";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity";

const JWT_SECRET = "unit-test-secret-with-at-least-32-chars";

describe("AuthService", () => {
    let service: AuthService;
    let users: {
        existsBy: jest.Mock;
        findOneBy: jest.Mock;
        create: jest.Mock;
        save: jest.Mock;
        createQueryBuilder: jest.Mock;
    };
    let storedUser: User | null;
    let env: Record<string, string | undefined>;
    const jwtService = new JwtService({ secret: JWT_SECRET });

    const makeUser = async (overrides: Partial<User> = {}): Promise<User> =>
        Object.assign(new User(), {
            id: 1,
            email: "jane@example.com",
            passwordHash: await bcrypt.hash("correct-password", 4),
            role: Role.USER,
            createdAt: new Date("2026-01-01T00:00:00Z"),
            updatedAt: new Date("2026-01-01T00:00:00Z"),
            ...overrides,
        });

    beforeEach(() => {
        storedUser = null;
        env = { JWT_EXPIRES_IN: "1h" };
        users = {
            existsBy: jest.fn().mockResolvedValue(false),
            findOneBy: jest.fn(),
            create: jest.fn((data: Partial<User>) =>
                Object.assign(new User(), data),
            ),
            save: jest.fn((user: User) =>
                Promise.resolve({
                    ...user,
                    id: 42,
                    createdAt: new Date("2026-01-01T00:00:00Z"),
                }),
            ),
            createQueryBuilder: jest.fn(() => ({
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn(() => Promise.resolve(storedUser)),
            })),
        };
        const config = {
            get: (key: string) => env[key],
            getOrThrow: (key: string) => env[key],
        } as unknown as ConfigService;

        service = new AuthService(
            users as unknown as Repository<User>,
            jwtService,
            config,
        );
    });

    describe("register", () => {
        const dto = {
            email: "jane@example.com",
            password: "correct-password",
            confirmPassword: "correct-password",
        };

        it("stores a bcrypt hash and never returns it", async () => {
            const result = await service.register(dto);

            const saved = users.save.mock.calls[0][0] as User;
            expect(saved.passwordHash).not.toBe(dto.password);
            await expect(
                bcrypt.compare(dto.password, saved.passwordHash),
            ).resolves.toBe(true);
            expect(result).toEqual({
                id: 42,
                email: dto.email,
                role: Role.USER,
                createdAt: expect.any(Date),
            });
            expect(result).not.toHaveProperty("passwordHash");
        });

        it("always creates a regular USER", async () => {
            await service.register({
                ...dto,
                role: Role.ADMIN,
            } as typeof dto);

            expect((users.save.mock.calls[0][0] as User).role).toBe(Role.USER);
        });

        it("rejects mismatching passwords", async () => {
            await expect(
                service.register({ ...dto, confirmPassword: "other" }),
            ).rejects.toBeInstanceOf(BadRequestException);
            expect(users.save).not.toHaveBeenCalled();
        });

        it("rejects an email that is already registered", async () => {
            users.existsBy.mockResolvedValue(true);

            await expect(service.register(dto)).rejects.toBeInstanceOf(
                ConflictException,
            );
            expect(users.save).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("returns a signed JWT with the user id, email and role", async () => {
            storedUser = await makeUser({ role: Role.ADMIN });

            const result = await service.login({
                email: "jane@example.com",
                password: "correct-password",
            });

            expect(result.tokenType).toBe("Bearer");
            expect(result.expiresIn).toBe("1h");
            const payload = await jwtService.verifyAsync<JwtPayload>(
                result.accessToken,
            );
            expect(payload).toMatchObject({
                sub: 1,
                email: "jane@example.com",
                role: Role.ADMIN,
            });
        });

        it("rejects a wrong password", async () => {
            storedUser = await makeUser();

            await expect(
                service.login({
                    email: "jane@example.com",
                    password: "wrong-password",
                }),
            ).rejects.toThrow(
                new UnauthorizedException("Invalid email or password"),
            );
        });

        it("rejects an unknown email with the same message", async () => {
            await expect(
                service.login({
                    email: "nobody@example.com",
                    password: "whatever-password",
                }),
            ).rejects.toThrow(
                new UnauthorizedException("Invalid email or password"),
            );
        });
    });

    describe("getProfile", () => {
        it("returns the public user fields", async () => {
            users.findOneBy.mockResolvedValue(await makeUser());

            const profile = await service.getProfile(1);

            expect(profile).toEqual({
                id: 1,
                email: "jane@example.com",
                role: Role.USER,
                createdAt: expect.any(Date),
            });
        });

        it("throws NotFound for an unknown user", async () => {
            users.findOneBy.mockResolvedValue(null);

            await expect(service.getProfile(99)).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });
    });

    describe("admin bootstrap", () => {
        it("creates the configured admin account when it is missing", async () => {
            env.ADMIN_EMAIL = " Admin@Example.com ";
            env.ADMIN_PASSWORD = "admin-password";

            await service.onApplicationBootstrap();

            expect(users.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: "admin@example.com",
                    role: Role.ADMIN,
                }),
            );
        });

        it("does nothing when the admin already exists", async () => {
            env.ADMIN_EMAIL = "admin@example.com";
            env.ADMIN_PASSWORD = "admin-password";
            users.existsBy.mockResolvedValue(true);

            await service.onApplicationBootstrap();

            expect(users.save).not.toHaveBeenCalled();
        });

        it("does nothing when no admin is configured", async () => {
            await service.onApplicationBootstrap();

            expect(users.existsBy).not.toHaveBeenCalled();
            expect(users.save).not.toHaveBeenCalled();
        });
    });
});
