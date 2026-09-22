import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { Role } from "@app/shared/auth/role.enum";

@Entity({ name: "users" })
@Unique("UQ_users_email", ["email"])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    email: string;

    // Never loaded unless explicitly selected.
    @Column({ name: "password_hash", type: "varchar", select: false })
    passwordHash: string;

    @Column({
        type: "enum",
        enum: Role,
        enumName: "user_role",
        default: Role.USER,
    })
    role: Role;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;
}
