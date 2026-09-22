import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import type { AuthUser } from "@app/shared/auth/role.enum";
import { OrderPatterns, Services } from "@app/shared/constants/services";
import { UserIdPayload } from "@app/shared/dtos/common/id-payloads";
import {
    CreateOrderDto,
    CreateOrderPayload,
} from "@app/shared/dtos/orders/create-order.dto";
import {
    OrderResponse,
    UserOrderPayload,
} from "@app/shared/dtos/orders/order-payloads";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

/** Every route acts on behalf of the authenticated user only. */
@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(@Inject(Services.ORDER) private readonly orders: RpcClient) {}

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateOrderDto,
    ): Promise<OrderResponse> {
        return this.orders.send<OrderResponse, CreateOrderPayload>(
            OrderPatterns.CREATE_ORDER,
            { ...dto, userId: user.id },
        );
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser): Promise<OrderResponse[]> {
        return this.orders.send<OrderResponse[], UserIdPayload>(
            OrderPatterns.FIND_USER_ORDERS,
            { userId: user.id },
        );
    }

    @Get(":id")
    findOne(
        @CurrentUser() user: AuthUser,
        @Param("id", ParseIntPipe) orderId: number,
    ): Promise<OrderResponse> {
        return this.orders.send<OrderResponse, UserOrderPayload>(
            OrderPatterns.FIND_USER_ORDER,
            { userId: user.id, orderId },
        );
    }

    @Patch(":id/cancel")
    cancel(
        @CurrentUser() user: AuthUser,
        @Param("id", ParseIntPipe) orderId: number,
    ): Promise<OrderResponse> {
        return this.orders.send<OrderResponse, UserOrderPayload>(
            OrderPatterns.CANCEL_USER_ORDER,
            { userId: user.id, orderId },
        );
    }
}
