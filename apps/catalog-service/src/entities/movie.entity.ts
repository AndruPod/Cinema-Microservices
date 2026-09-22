import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { decimalTransformer } from "@app/shared/database/decimal.transformer";

@Entity({ name: "movies" })
@Unique("UQ_movies_title_release_year", ["title", "releaseYear"])
@Check("CHK_movies_ticket_price", `"ticket_price" >= 0`)
@Check("CHK_movies_duration", `"duration_minutes" > 0`)
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ name: "release_year", type: "smallint" })
    releaseYear: number;

    @Column({ name: "duration_minutes", type: "smallint" })
    durationMinutes: number;

    @Column({
        name: "ticket_price",
        type: "numeric",
        precision: 10,
        scale: 2,
        transformer: decimalTransformer,
    })
    ticketPrice: number;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;
}
