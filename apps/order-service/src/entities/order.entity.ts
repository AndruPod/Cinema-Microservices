import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { decimalTransformer } from "@app/shared/database/decimal.transformer";
import { OrderStatus } from "@app/shared/dtos/orders/order-payloads";

/**
 * A ticket order. Movie data is copied at purchase time (snapshot), so later
 * catalog changes or deletions never alter an existing order. `userId` and
 * `movieId` reference other services' databases, so there are no foreign keys.
 */
@Entity({ name: "orders" })
@Index("IDX_orders_user_id_created_at", ["userId", "createdAt"])
@Check("CHK_orders_quantity", `"quantity" > 0`)
@Check("CHK_orders_total_price", `"total_price" >= 0`)
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "user_id", type: "integer" })
    userId: number;

    @Index("IDX_orders_movie_id")
    @Column({ name: "movie_id", type: "integer" })
    movieId: number;

    @Column({
        name: "movie_title",
        type: "varchar",
        length: 255,
        update: false,
    })
    movieTitle: string;

    @Column({ name: "movie_release_year", type: "smallint", update: false })
    movieReleaseYear: number;

    @Column({
        name: "ticket_price",
        type: "numeric",
        precision: 10,
        scale: 2,
        transformer: decimalTransformer,
        update: false,
    })
    ticketPrice: number;

    @Column({ type: "smallint", update: false })
    quantity: number;

    @Column({
        name: "total_price",
        type: "numeric",
        precision: 12,
        scale: 2,
        transformer: decimalTransformer,
        update: false,
    })
    totalPrice: number;

    @Column({
        type: "enum",
        enum: OrderStatus,
        enumName: "order_status",
        default: OrderStatus.CONFIRMED,
    })
    status: OrderStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;
}
