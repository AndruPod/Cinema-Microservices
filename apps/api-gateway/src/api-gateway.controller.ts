import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateMovieDto } from "@app/shared/dtos/create-movie.dto";
import { AuthPatterns, CatalogPatterns } from "@app/shared/constants/services";
import { RegisterDto } from "@app/shared/dtos/register.dto";
import { LoginDto } from "@app/shared/dtos/login.dto";

@Controller()
export class ApiGatewayController {
    constructor(
        @Inject("CATALOG_SERVICE") private catalogClient: ClientProxy,
        @Inject("AUTH_SERVICE") private authClient: ClientProxy,
    ) {}

    @Get("health")
    health() {
        return { status: "OK" };
    }

    @Get("get-movies")
    getAllMovies() {
        return this.catalogClient.send(CatalogPatterns.GET_ALL_MOVIES, {});
    }

    @Get("get-movie/:id")
    getOneMovie(@Param("id") id: number) {
        return this.catalogClient.send(CatalogPatterns.GET_ONE_MOVIE, id);
    }

    @Post("create-movie")
    create(@Body() movie: CreateMovieDto) {
        return this.catalogClient.send(CatalogPatterns.CREATE_MOVIE, movie);
    }

    @Post("register")
    register(@Body() user: RegisterDto) {
        return this.authClient.send(AuthPatterns.REGISTER, user);
    }

    @Post("login")
    login(@Body() user: LoginDto) {
        return this.authClient.send(AuthPatterns.LOGIN, user);
    }

}
