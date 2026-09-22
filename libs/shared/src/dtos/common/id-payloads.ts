import { IsInt, IsPositive } from "class-validator";

/** RPC payloads that carry identifiers. Validated again inside each service. */
export class IdPayload {
    @IsInt()
    @IsPositive()
    id: number;
}

export class UserIdPayload {
    @IsInt()
    @IsPositive()
    userId: number;
}
