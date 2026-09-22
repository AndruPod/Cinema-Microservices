import {
    BadRequestException,
    HttpStatus,
    NotFoundException,
} from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { QueryFailedError } from "typeorm";
import { toRpcErrorPayload } from "./rpc-error";

describe("toRpcErrorPayload", () => {
    it("keeps status and message of Nest HTTP exceptions", () => {
        expect(
            toRpcErrorPayload(new NotFoundException("Movie 1 not found")),
        ).toEqual({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Movie 1 not found",
            error: "Not Found",
        });
    });

    it("keeps the list of validation messages", () => {
        const payload = toRpcErrorPayload(
            new BadRequestException(["email must be an email"]),
        );

        expect(payload.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(payload.message).toEqual(["email must be an email"]);
    });

    it("passes through RpcExceptions that already carry a payload", () => {
        const error = { statusCode: 409, message: "Taken", error: "Conflict" };

        expect(toRpcErrorPayload(new RpcException(error))).toEqual(error);
    });

    it("maps PostgreSQL unique violations to 409 Conflict", () => {
        const driverError = Object.assign(new Error("duplicate key"), {
            code: "23505",
        });
        const exception = new QueryFailedError("INSERT ...", [], driverError);

        expect(toRpcErrorPayload(exception).statusCode).toBe(
            HttpStatus.CONFLICT,
        );
    });

    it("hides details of unexpected errors", () => {
        expect(
            toRpcErrorPayload(new Error("password=secret in stack")),
        ).toEqual({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
            error: "Internal Server Error",
        });
    });
});
