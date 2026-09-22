import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { DatabaseEnv } from "@app/shared/config/env.validation";
import { DEFAULT_RPC_TIMEOUT_MS } from "@app/shared/constants/services";

export class OrderEnv extends DatabaseEnv {
    @IsString()
    @IsNotEmpty()
    ORDER_DB_NAME: string;

    @IsString()
    ORDER_SERVICE_LISTEN_HOST: string = "0.0.0.0";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    ORDER_SERVICE_PORT: number = 3002;

    // The order service calls the catalog service to look up movies.
    @IsString()
    @IsNotEmpty()
    CATALOG_SERVICE_HOST: string = "localhost";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    CATALOG_SERVICE_PORT: number = 3001;

    @Type(() => Number)
    @IsInt()
    @Min(100)
    RPC_TIMEOUT_MS: number = DEFAULT_RPC_TIMEOUT_MS;
}
