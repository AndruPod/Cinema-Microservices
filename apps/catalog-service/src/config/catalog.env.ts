import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { DatabaseEnv } from "@app/shared/config/env.validation";

export class CatalogEnv extends DatabaseEnv {
    @IsString()
    @IsNotEmpty()
    CATALOG_DB_NAME: string;

    @IsString()
    CATALOG_SERVICE_LISTEN_HOST: string = "0.0.0.0";

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    CATALOG_SERVICE_PORT: number = 3001;
}
