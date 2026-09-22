import { Transform } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value;

export class CreateMovieDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @Transform(trim)
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsInt()
    @Min(1888)
    @Max(2100)
    releaseYear: number;

    @IsInt()
    @Min(1)
    @Max(600)
    durationMinutes: number;

    @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
    @Min(0)
    @Max(10000)
    ticketPrice: number;
}
