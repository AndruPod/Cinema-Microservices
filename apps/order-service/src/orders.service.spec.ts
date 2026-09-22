import { ConflictException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CatalogPatterns } from "@app/shared/constants/services";
import { MovieResponse } from "@app/shared/dtos/movies/movie-response";
import { OrderStatus } from "@app/shared/dtos/orders/order-payloads";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
    let service: OrdersService;
    let orders: {
        create: jest.Mock;
        save: jest.Mock;
        find: jest.Mock;
        findOneBy: jest.Mock;
    };
    let catalog: { send: jest.Mock };

    const movie: MovieResponse = {
        id: 7,
        title: "Arrival",
        description: null,
        releaseYear: 2016,
        durationMinutes: 116,
        ticketPrice: 12.99,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const order = (overrides: Partial<Order> = {}): Order =>
        Object.assign(new Order(), {
            id: 1,
            userId: 10,
            movieId: 7,
            status: OrderStatus.CONFIRMED,
            ...overrides,
        });

    beforeEach(() => {
        orders = {
            create: jest.fn((data: Partial<Order>) => ({ ...data })),
            save: jest.fn((data: Order) =>
                Promise.resolve({ ...data, id: data.id ?? 1 }),
            ),
            find: jest.fn().mockResolvedValue([]),
            findOneBy: jest.fn(),
        };
        catalog = { send: jest.fn().mockResolvedValue(movie) };
        service = new OrdersService(
            orders as unknown as Repository<Order>,
            catalog as unknown as RpcClient,
        );
    });

    describe("create", () => {
        it("stores a movie snapshot and a backend-calculated total", async () => {
            const created = await service.create({
                userId: 10,
                movieId: 7,
                quantity: 3,
            });

            expect(catalog.send).toHaveBeenCalledWith(
                CatalogPatterns.FIND_ONE_MOVIE,
                { id: 7 },
            );
            expect(created).toMatchObject({
                userId: 10,
                movieId: 7,
                movieTitle: "Arrival",
                movieReleaseYear: 2016,
                ticketPrice: 12.99,
                quantity: 3,
                // 12.99 * 3 in floating point is 38.970000000000006.
                totalPrice: 38.97,
                status: OrderStatus.CONFIRMED,
            });
        });

        it("does not create an order when the movie does not exist", async () => {
            catalog.send.mockRejectedValue(
                new NotFoundException("Movie 7 not found"),
            );

            await expect(
                service.create({ userId: 10, movieId: 7, quantity: 1 }),
            ).rejects.toBeInstanceOf(NotFoundException);
            expect(orders.save).not.toHaveBeenCalled();
        });
    });

    describe("ownership", () => {
        it("lists only the orders of the given user", async () => {
            await service.findAllForUser(10);

            expect(orders.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { userId: 10 } }),
            );
        });

        it("looks up a single order together with its owner", async () => {
            orders.findOneBy.mockResolvedValue(order());

            await expect(service.findOneForUser(10, 1)).resolves.toMatchObject({
                id: 1,
                userId: 10,
            });
            expect(orders.findOneBy).toHaveBeenCalledWith({
                id: 1,
                userId: 10,
            });
        });

        it("reports another user's order as not found", async () => {
            // The repository finds nothing for (id: 1, userId: 99).
            orders.findOneBy.mockResolvedValue(null);

            await expect(service.findOneForUser(99, 1)).rejects.toThrow(
                new NotFoundException("Order 1 not found"),
            );
        });

        it("does not let a user cancel another user's order", async () => {
            orders.findOneBy.mockResolvedValue(null);

            await expect(service.cancel(99, 1)).rejects.toBeInstanceOf(
                NotFoundException,
            );
            expect(orders.save).not.toHaveBeenCalled();
        });
    });

    describe("cancel", () => {
        it("marks a confirmed order as cancelled", async () => {
            orders.findOneBy.mockResolvedValue(order());

            const cancelled = await service.cancel(10, 1);

            expect(cancelled.status).toBe(OrderStatus.CANCELLED);
        });

        it("rejects cancelling twice", async () => {
            orders.findOneBy.mockResolvedValue(
                order({ status: OrderStatus.CANCELLED }),
            );

            await expect(service.cancel(10, 1)).rejects.toBeInstanceOf(
                ConflictException,
            );
        });
    });
});
