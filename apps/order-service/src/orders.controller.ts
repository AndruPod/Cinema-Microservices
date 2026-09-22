import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OrderPatterns } from "@app/shared/constants/services";
import { UserIdPayload } from "@app/shared/dtos/common/id-payloads";
import { CreateOrderPayload } from "@app/shared/dtos/orders/create-order.dto";
import { UserOrderPayload } from "@app/shared/dtos/orders/order-payloads";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @MessagePattern(OrderPatterns.CREATE_ORDER)
    create(@Payload() payload: CreateOrderPayload) {
        return this.ordersService.create(payload);
    }

    @MessagePattern(OrderPatterns.FIND_USER_ORDERS)
    findAll(@Payload() { userId }: UserIdPayload) {
        return this.ordersService.findAllForUser(userId);
    }

    @MessagePattern(OrderPatterns.FIND_USER_ORDER)
    findOne(@Payload() { userId, orderId }: UserOrderPayload) {
        return this.ordersService.findOneForUser(userId, orderId);
    }

    @MessagePattern(OrderPatterns.CANCEL_USER_ORDER)
    cancel(@Payload() { userId, orderId }: UserOrderPayload) {
        return this.ordersService.cancel(userId, orderId);
    }
}
