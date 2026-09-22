import { Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
    MinLength,
} from "class-validator";
import { DEFAULT_RPC_TIMEOUT_MS } from "@app/shared/constants/services";

export class GatewayEnv {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    API_GATEWAY_PORT: number = 3000;

    /** Shared with the auth service: the gateway verifies tokens it issues. */
    @IsString()
    @MinLength(32)
    JWT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    AUTH_SERVICE_HOST: string = "localhost";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    AUTH_SERVICE_PORT: number = 3003;

    @IsString()
    @IsNotEmpty()
    CATALOG_SERVICE_HOST: string = "localhost";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    CATALOG_SERVICE_PORT: number = 3001;

    @IsString()
    @IsNotEmpty()
    ORDER_SERVICE_HOST: string = "localhost";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    ORDER_SERVICE_PORT: number = 3002;

    @Type(() => Number)
    @IsInt()
    @Min(100)
    RPC_TIMEOUT_MS: number = DEFAULT_RPC_TIMEOUT_MS;
}
