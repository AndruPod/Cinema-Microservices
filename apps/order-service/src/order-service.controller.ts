import { Controller, Get } from "@nestjs/common";
import { OrderServiceService } from "./order-service.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OrderPatterns } from "@app/shared/constants/services";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "@app/shared/dtos/create-order.dto";

@Controller()
export class OrderServiceController {
    constructor(private readonly orderServiceService: OrderServiceService) {}

    @MessagePattern(OrderPatterns.GET_ALL_USER_ORDERS)
    getAll(@Payload() user_id: number): Promise<Order[] | null> {
        return this.orderServiceService.getAll(user_id);
    }

    @MessagePattern(OrderPatterns.CREATE_ORDER)
    create(@Payload() order: CreateOrderDto) {
        return this.orderServiceService.create(order);
    }
}
