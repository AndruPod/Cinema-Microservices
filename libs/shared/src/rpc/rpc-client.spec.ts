import { HttpException, HttpStatus } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { NEVER, of, throwError } from "rxjs";
import { Services } from "../constants/services";
import { RpcClient } from "./rpc-client";

describe("RpcClient", () => {
    const send = jest.fn();
    const proxy = { send, close: jest.fn() } as unknown as ClientProxy;
    const client = new RpcClient(proxy, Services.CATALOG, 50);

    const statusOf = async (promise: Promise<unknown>) => {
        const error: unknown = await promise.catch((e: unknown) => e);
        expect(error).toBeInstanceOf(HttpException);
        return (error as HttpException).getStatus();
    };

    beforeEach(() => send.mockReset());

    it("resolves with the service response", async () => {
        send.mockReturnValue(of({ id: 1 }));

        await expect(client.send("pattern", { id: 1 })).resolves.toEqual({
            id: 1,
        });
        expect(send).toHaveBeenCalledWith("pattern", { id: 1 });
    });

    it("converts a service error payload into the same HTTP status", async () => {
        send.mockReturnValue(
            throwError(() => ({
                statusCode: 404,
                message: "Movie 7 not found",
                error: "Not Found",
            })),
        );

        const error = (await client
            .send("pattern", {})
            .catch((e: unknown) => e)) as HttpException;

        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
            message: "Movie 7 not found",
        });
    });

    it("fails with 504 when the service does not answer in time", async () => {
        send.mockReturnValue(NEVER);

        expect(await statusOf(client.send("pattern", {}))).toBe(
            HttpStatus.GATEWAY_TIMEOUT,
        );
    });

    it("fails with 503 when the service is unreachable", async () => {
        send.mockReturnValue(
            throwError(() =>
                Object.assign(new Error("connect ECONNREFUSED"), {
                    code: "ECONNREFUSED",
                }),
            ),
        );

        expect(await statusOf(client.send("pattern", {}))).toBe(
            HttpStatus.SERVICE_UNAVAILABLE,
        );
    });

    it("fails with 502 on any other transport error", async () => {
        send.mockReturnValue(throwError(() => new Error("boom")));

        expect(await statusOf(client.send("pattern", {}))).toBe(
            HttpStatus.BAD_GATEWAY,
        );
    });
});
