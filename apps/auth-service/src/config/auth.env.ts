import { Type } from "class-transformer";
import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
    MinLength,
    ValidateIf,
} from "class-validator";
import { DatabaseEnv } from "@app/shared/config/env.validation";

export class AuthEnv extends DatabaseEnv {
    @IsString()
    @IsNotEmpty()
    USERS_DB_NAME: string;

    @IsString()
    AUTH_SERVICE_LISTEN_HOST: string = "0.0.0.0";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    AUTH_SERVICE_PORT: number = 3003;

    @IsString()
    @MinLength(32)
    JWT_SECRET: string;

    /** Any value accepted by `jsonwebtoken`, e.g. "15m", "1h", "7d". */
    @IsString()
    @IsNotEmpty()
    JWT_EXPIRES_IN: string = "1h";

    /** Optional admin account created on startup if it does not exist. */
    @ValidateIf((env: AuthEnv) => Boolean(env.ADMIN_EMAIL))
    @IsEmail()
    ADMIN_EMAIL?: string;

    @ValidateIf((env: AuthEnv) => Boolean(env.ADMIN_EMAIL))
    @IsString()
    @MinLength(8)
    ADMIN_PASSWORD?: string;
}
