import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { CreateMovieDto } from "@app/shared/dtos/movies/create-movie.dto";
import { UpdateMovieDto } from "@app/shared/dtos/movies/update-movie.dto";
import { Movie } from "./entities/movie.entity";

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie) private readonly movies: Repository<Movie>,
    ) {}

    findAll(): Promise<Movie[]> {
        return this.movies.find({ order: { id: "ASC" } });
    }

    async findOne(id: number): Promise<Movie> {
        const movie = await this.movies.findOneBy({ id });
        if (!movie) throw new NotFoundException(`Movie ${id} not found`);

        return movie;
    }

    async create(dto: CreateMovieDto): Promise<Movie> {
        await this.assertTitleIsFree(dto.title, dto.releaseYear);

        return this.movies.save(this.movies.create(dto));
    }

    async update(id: number, changes: UpdateMovieDto): Promise<Movie> {
        const movie = await this.findOne(id);

        const title = changes.title ?? movie.title;
        const releaseYear = changes.releaseYear ?? movie.releaseYear;
        if (title !== movie.title || releaseYear !== movie.releaseYear) {
            await this.assertTitleIsFree(title, releaseYear, id);
        }

        return this.movies.save(this.movies.merge(movie, changes));
    }

    async remove(id: number): Promise<void> {
        const { affected } = await this.movies.delete({ id });
        if (!affected) throw new NotFoundException(`Movie ${id} not found`);
    }

    private async assertTitleIsFree(
        title: string,
        releaseYear: number,
        excludeId?: number,
    ): Promise<void> {
        const exists = await this.movies.existsBy({
            title,
            releaseYear,
            ...(excludeId ? { id: Not(excludeId) } : {}),
        });

        if (exists) {
            throw new ConflictException(
                `Movie "${title}" (${releaseYear}) already exists`,
            );
        }
    }
}
