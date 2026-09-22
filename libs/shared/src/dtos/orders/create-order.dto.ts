import { IsInt, IsPositive, Max, Min } from "class-validator";

export const MAX_TICKETS_PER_ORDER = 10;

/** HTTP body: price and owner are never accepted from the client. */
export class CreateOrderDto {
    @IsInt()
    @IsPositive()
    movieId: number;

    @IsInt()
    @Min(1)
    @Max(MAX_TICKETS_PER_ORDER)
    quantity: number;
}

/** RPC payload: the gateway adds the id of the authenticated user. */
export class CreateOrderPayload extends CreateOrderDto {
    @IsInt()
    @IsPositive()
    userId: number;
}
