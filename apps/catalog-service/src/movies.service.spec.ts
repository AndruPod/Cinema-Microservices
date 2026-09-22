import { ConflictException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateMovieDto } from "@app/shared/dtos/movies/create-movie.dto";
import { Movie } from "./entities/movie.entity";
import { MoviesService } from "./movies.service";

describe("MoviesService", () => {
    let service: MoviesService;
    let movies: {
        find: jest.Mock;
        findOneBy: jest.Mock;
        existsBy: jest.Mock;
        create: jest.Mock;
        merge: jest.Mock;
        save: jest.Mock;
        delete: jest.Mock;
    };

    const dto: CreateMovieDto = {
        title: "Arrival",
        description: "Linguist meets heptapods.",
        releaseYear: 2016,
        durationMinutes: 116,
        ticketPrice: 12.5,
    };
    const existing = (): Movie => Object.assign(new Movie(), { id: 1, ...dto });

    beforeEach(() => {
        movies = {
            find: jest.fn().mockResolvedValue([]),
            findOneBy: jest.fn(),
            existsBy: jest.fn().mockResolvedValue(false),
            create: jest.fn((data: Partial<Movie>) => ({ ...data })),
            merge: jest.fn((movie: Movie, changes: Partial<Movie>) =>
                Object.assign(movie, changes),
            ),
            save: jest.fn((movie: Movie) =>
                Promise.resolve({ ...movie, id: movie.id ?? 1 }),
            ),
            delete: jest.fn(),
        };
        service = new MoviesService(movies as unknown as Repository<Movie>);
    });

    it("creates a movie when the title/year pair is free", async () => {
        const movie = await service.create(dto);

        expect(movies.existsBy).toHaveBeenCalledWith({
            title: "Arrival",
            releaseYear: 2016,
        });
        expect(movie).toMatchObject({ id: 1, ...dto });
    });

    it("rejects a duplicate title for the same release year", async () => {
        movies.existsBy.mockResolvedValue(true);

        await expect(service.create(dto)).rejects.toBeInstanceOf(
            ConflictException,
        );
        expect(movies.save).not.toHaveBeenCalled();
    });

    it("throws NotFound for an unknown movie id", async () => {
        movies.findOneBy.mockResolvedValue(null);

        await expect(service.findOne(404)).rejects.toThrow(
            new NotFoundException("Movie 404 not found"),
        );
    });

    it("updates only the provided fields", async () => {
        movies.findOneBy.mockResolvedValue(existing());

        const updated = await service.update(1, { ticketPrice: 9.99 });

        expect(updated).toMatchObject({ title: "Arrival", ticketPrice: 9.99 });
        // Title/year unchanged, so no uniqueness check is needed.
        expect(movies.existsBy).not.toHaveBeenCalled();
    });

    it("rejects renaming a movie to an existing title/year", async () => {
        movies.findOneBy.mockResolvedValue(existing());
        movies.existsBy.mockResolvedValue(true);

        await expect(
            service.update(1, { title: "Dune" }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(movies.save).not.toHaveBeenCalled();
    });

    it("throws NotFound when deleting an unknown movie", async () => {
        movies.delete.mockResolvedValue({ affected: 0 });

        await expect(service.remove(5)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it("deletes an existing movie", async () => {
        movies.delete.mockResolvedValue({ affected: 1 });

        await expect(service.remove(1)).resolves.toBeUndefined();
        expect(movies.delete).toHaveBeenCalledWith({ id: 1 });
    });
});
