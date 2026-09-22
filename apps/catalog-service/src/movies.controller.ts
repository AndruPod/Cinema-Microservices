import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CatalogPatterns } from "@app/shared/constants/services";
import { IdPayload } from "@app/shared/dtos/common/id-payloads";
import { CreateMovieDto } from "@app/shared/dtos/movies/create-movie.dto";
import { UpdateMoviePayload } from "@app/shared/dtos/movies/update-movie.dto";
import { MoviesService } from "./movies.service";

@Controller()
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @MessagePattern(CatalogPatterns.FIND_ALL_MOVIES)
    findAll() {
        return this.moviesService.findAll();
    }

    @MessagePattern(CatalogPatterns.FIND_ONE_MOVIE)
    findOne(@Payload() { id }: IdPayload) {
        return this.moviesService.findOne(id);
    }

    @MessagePattern(CatalogPatterns.CREATE_MOVIE)
    create(@Payload() dto: CreateMovieDto) {
        return this.moviesService.create(dto);
    }

    @MessagePattern(CatalogPatterns.UPDATE_MOVIE)
    update(@Payload() { id, changes }: UpdateMoviePayload) {
        return this.moviesService.update(id, changes);
    }

    @MessagePattern(CatalogPatterns.DELETE_MOVIE)
    async remove(@Payload() { id }: IdPayload) {
        await this.moviesService.remove(id);
        return { id, deleted: true };
    }
}
