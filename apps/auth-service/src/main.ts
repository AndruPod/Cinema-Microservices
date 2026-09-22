import { Services } from "@app/shared/constants/services";
import { bootstrapMicroservice } from "@app/shared/rpc/bootstrap-microservice";
import { AuthServiceModule } from "./auth-service.module";

void bootstrapMicroservice(AuthServiceModule, Services.AUTH);
