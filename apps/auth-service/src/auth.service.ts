import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    OnApplicationBootstrap,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { JwtPayload, Role } from "@app/shared/auth/role.enum";
import { AccessToken, PublicUser } from "@app/shared/dtos/auth/auth-responses";
import { LoginDto } from "@app/shared/dtos/auth/login.dto";
import { RegisterDto } from "@app/shared/dtos/auth/register.dto";
import { User } from "./entities/user.entity";

export const BCRYPT_SALT_ROUNDS = 12;
const INVALID_CREDENTIALS = "Invalid email or password";

@Injectable()
export class AuthService implements OnApplicationBootstrap {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.ensureAdminAccount();
    }

    async register(dto: RegisterDto): Promise<PublicUser> {
        if (dto.password !== dto.confirmPassword) {
            throw new BadRequestException("Passwords do not match");
        }

        if (await this.users.existsBy({ email: dto.email })) {
            throw new ConflictException("Email is already registered");
        }

        // Public registration always creates a regular user.
        return this.createUser(dto.email, dto.password, Role.USER);
    }

    async login(dto: LoginDto): Promise<AccessToken> {
        const user = await this.users
            .createQueryBuilder("user")
            .addSelect("user.passwordHash")
            .where("user.email = :email", { email: dto.email })
            .getOne();

        const passwordMatches =
            user !== null &&
            (await bcrypt.compare(dto.password, user.passwordHash));

        // Same error for unknown email and wrong password: no user enumeration.
        if (!user || !passwordMatches) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            tokenType: "Bearer",
            expiresIn: this.config.getOrThrow<string>("JWT_EXPIRES_IN"),
        };
    }

    async getProfile(userId: number): Promise<PublicUser> {
        const user = await this.users.findOneBy({ id: userId });
        if (!user) throw new NotFoundException("User not found");

        return this.toPublicUser(user);
    }

    private async ensureAdminAccount(): Promise<void> {
        const email = this.config.get<string>("ADMIN_EMAIL");
        const password = this.config.get<string>("ADMIN_PASSWORD");
        if (!email || !password) return;

        const normalizedEmail = email.trim().toLowerCase();
        if (await this.users.existsBy({ email: normalizedEmail })) return;

        await this.createUser(normalizedEmail, password, Role.ADMIN);
        this.logger.log(`Created admin account ${normalizedEmail}`);
    }

    private async createUser(
        email: string,
        password: string,
        role: Role,
    ): Promise<PublicUser> {
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await this.users.save(
            this.users.create({ email, passwordHash, role }),
        );

        return this.toPublicUser(user);
    }

    private toPublicUser(user: User): PublicUser {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
}
