import { Body, Controller, Get } from "@nestjs/common";
import { CatalogServiceService } from "./catalog-service.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateMovieDto } from "@app/shared/dtos/create-movie.dto";
import { CatalogPatterns } from "@app/shared/constants/services";

@Controller()
export class CatalogServiceController {
    constructor(
        private readonly catalogServiceService: CatalogServiceService,
    ) {}

    @MessagePattern(CatalogPatterns.GET_ALL_MOVIES)
    getAll() {
        return this.catalogServiceService.getAll();
    }

    @MessagePattern(CatalogPatterns.GET_ONE_MOVIE)
    getOne(@Payload() id: number) {
        return this.catalogServiceService.getOne(id);
    }

    @MessagePattern(CatalogPatterns.CREATE_MOVIE)
    create(@Payload() movie: CreateMovieDto) {
        return this.catalogServiceService.create(movie);
    }
}
