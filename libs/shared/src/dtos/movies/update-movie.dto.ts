import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { IdPayload } from "../common/id-payloads";
import { CreateMovieDto } from "./create-movie.dto";

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

export class UpdateMoviePayload extends IdPayload {
    @IsDefined()
    @ValidateNested()
    @Type(() => UpdateMovieDto)
    changes: UpdateMovieDto;
}
