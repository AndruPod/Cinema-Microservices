import { Services } from "@app/shared/constants/services";
import { bootstrapMicroservice } from "@app/shared/rpc/bootstrap-microservice";
import { OrderServiceModule } from "./order-service.module";

void bootstrapMicroservice(OrderServiceModule, Services.ORDER);
