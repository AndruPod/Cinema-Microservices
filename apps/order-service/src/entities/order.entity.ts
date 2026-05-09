import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    movie_id: number;

    @Column()
    status: string;

    @Column()
    priceAtPurchase: number;
}
