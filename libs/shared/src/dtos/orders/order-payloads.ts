import { IsInt, IsPositive } from "class-validator";
import { UserIdPayload } from "../common/id-payloads";

export class UserOrderPayload extends UserIdPayload {
    @IsInt()
    @IsPositive()
    orderId: number;
}

export enum OrderStatus {
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export interface OrderResponse {
    id: number;
    userId: number;
    movieId: number;
    movieTitle: string;
    movieReleaseYear: number;
    ticketPrice: number;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
