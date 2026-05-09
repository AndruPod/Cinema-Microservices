import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "@app/shared/dtos/create-order.dto";

@Injectable()
export class OrderServiceService {
    @InjectRepository(Order) orderRepository: Repository<Order>;

    async getAll(user_id: number): Promise<Order[] | null> {
        return this.orderRepository.find({
            where: {
                user_id: user_id,
            },
        });
    }

    async create(order: CreateOrderDto): Promise<boolean> {
        return true;
    }
}
