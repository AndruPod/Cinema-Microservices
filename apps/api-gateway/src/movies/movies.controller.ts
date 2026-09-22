import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { Role } from "@app/shared/auth/role.enum";
import { CatalogPatterns, Services } from "@app/shared/constants/services";
import { IdPayload } from "@app/shared/dtos/common/id-payloads";
import { CreateMovieDto } from "@app/shared/dtos/movies/create-movie.dto";
import { MovieResponse } from "@app/shared/dtos/movies/movie-response";
import {
    UpdateMovieDto,
    UpdateMoviePayload,
} from "@app/shared/dtos/movies/update-movie.dto";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("movies")
export class MoviesController {
    constructor(
        @Inject(Services.CATALOG) private readonly catalog: RpcClient,
    ) {}

    @Get()
    findAll(): Promise<MovieResponse[]> {
        return this.catalog.send<MovieResponse[]>(
            CatalogPatterns.FIND_ALL_MOVIES,
            {},
        );
    }

    @Get(":id")
    findOne(@Param("id", ParseIntPipe) id: number): Promise<MovieResponse> {
        return this.catalog.send<MovieResponse, IdPayload>(
            CatalogPatterns.FIND_ONE_MOVIE,
            { id },
        );
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateMovieDto): Promise<MovieResponse> {
        return this.catalog.send<MovieResponse, CreateMovieDto>(
            CatalogPatterns.CREATE_MOVIE,
            dto,
        );
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param("id", ParseIntPipe) id: number,
        @Body() changes: UpdateMovieDto,
    ): Promise<MovieResponse> {
        return this.catalog.send<MovieResponse, UpdateMoviePayload>(
            CatalogPatterns.UPDATE_MOVIE,
            { id, changes },
        );
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
        await this.catalog.send<unknown, IdPayload>(
            CatalogPatterns.DELETE_MOVIE,
            { id },
        );
    }
}
