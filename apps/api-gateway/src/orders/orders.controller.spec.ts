import { AuthUser, Role } from "@app/shared/auth/role.enum";
import { OrderPatterns } from "@app/shared/constants/services";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { OrdersController } from "./orders.controller";

describe("OrdersController (gateway)", () => {
    const send = jest.fn().mockResolvedValue({});
    const controller = new OrdersController({ send } as unknown as RpcClient);
    const user: AuthUser = {
        id: 10,
        email: "jane@example.com",
        role: Role.USER,
    };

    beforeEach(() => send.mockClear());

    it("creates the order for the user from the token", async () => {
        await controller.create(user, { movieId: 7, quantity: 2 });

        expect(send).toHaveBeenCalledWith(OrderPatterns.CREATE_ORDER, {
            movieId: 7,
            quantity: 2,
            userId: 10,
        });
    });

    it("scopes single-order lookups to the authenticated user", async () => {
        await controller.findOne(user, 3);

        expect(send).toHaveBeenCalledWith(OrderPatterns.FIND_USER_ORDER, {
            userId: 10,
            orderId: 3,
        });
    });

    it("scopes cancellation to the authenticated user", async () => {
        await controller.cancel(user, 3);

        expect(send).toHaveBeenCalledWith(OrderPatterns.CANCEL_USER_ORDER, {
            userId: 10,
            orderId: 3,
        });
    });
});
