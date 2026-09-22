import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatalogPatterns, Services } from "@app/shared/constants/services";
import { fromCents, toCents } from "@app/shared/database/decimal.transformer";
import { IdPayload } from "@app/shared/dtos/common/id-payloads";
import { MovieResponse } from "@app/shared/dtos/movies/movie-response";
import { CreateOrderPayload } from "@app/shared/dtos/orders/create-order.dto";
import { OrderStatus } from "@app/shared/dtos/orders/order-payloads";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly orders: Repository<Order>,
        @Inject(Services.CATALOG) private readonly catalog: RpcClient,
    ) {}

    async create({
        userId,
        movieId,
        quantity,
    }: CreateOrderPayload): Promise<Order> {
        // Throws a 404 HttpException if the catalog does not know the movie.
        const movie = await this.catalog.send<MovieResponse, IdPayload>(
            CatalogPatterns.FIND_ONE_MOVIE,
            { id: movieId },
        );

        const order = this.orders.create({
            userId,
            movieId: movie.id,
            movieTitle: movie.title,
            movieReleaseYear: movie.releaseYear,
            ticketPrice: movie.ticketPrice,
            quantity,
            totalPrice: fromCents(toCents(movie.ticketPrice) * quantity),
            status: OrderStatus.CONFIRMED,
        });

        return this.orders.save(order);
    }

    findAllForUser(userId: number): Promise<Order[]> {
        return this.orders.find({
            where: { userId },
            order: { createdAt: "DESC", id: "DESC" },
        });
    }

    /**
     * Orders are always looked up together with their owner. Another user's
     * order is reported as "not found" so its existence is not revealed.
     */
    async findOneForUser(userId: number, orderId: number): Promise<Order> {
        const order = await this.orders.findOneBy({ id: orderId, userId });
        if (!order) throw new NotFoundException(`Order ${orderId} not found`);

        return order;
    }

    async cancel(userId: number, orderId: number): Promise<Order> {
        const order = await this.findOneForUser(userId, orderId);

        if (order.status === OrderStatus.CANCELLED) {
            throw new ConflictException(
                `Order ${orderId} is already cancelled`,
            );
        }

        order.status = OrderStatus.CANCELLED;
        return this.orders.save(order);
    }
}
