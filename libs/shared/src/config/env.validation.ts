import { plainToInstance, Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
    validateSync,
} from "class-validator";

type ClassConstructor<T> = new () => T;

/**
 * Builds a `validate` function for `ConfigModule.forRoot()`.
 * The application fails to start with a readable message when a variable is
 * missing or malformed. Class field initializers act as defaults.
 */
export function createEnvValidator<T extends object>(
    schema: ClassConstructor<T>,
) {
    return (config: Record<string, unknown>): T => {
        const validated = plainToInstance(schema, config, {
            enableImplicitConversion: true,
        });
        const errors = validateSync(validated);

        if (errors.length > 0) {
            const details = errors
                .map(
                    (error) =>
                        `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(", ")}`,
                )
                .join("\n");
            throw new Error(`Invalid environment configuration:\n${details}`);
        }

        return validated;
    };
}

export class DatabaseEnv {
    @IsString()
    @IsNotEmpty()
    DB_HOST: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    DB_PORT: number = 5432;

    @IsString()
    @IsNotEmpty()
    DB_USER: string;

    @IsString()
    @IsNotEmpty()
    DB_PASSWORD: string;
}
