import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Movie } from "./entities/movie.entity";
import { Repository } from "typeorm";
import { CreateMovieDto } from "@app/shared/dtos/create-movie.dto";

@Injectable()
export class CatalogServiceService {
    @InjectRepository(Movie) moviesRepository: Repository<Movie>;

    async getAll(): Promise<Movie[] | undefined> {
        return await this.moviesRepository.find();
    }

    async getOne(id: number): Promise<Movie | null> {
        return await this.moviesRepository.findOneBy({ id });
    }

    async create(movie: CreateMovieDto) {
        const newMovie = this.moviesRepository.create(movie);
        return await this.moviesRepository.save(newMovie);
    }
}
