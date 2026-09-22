import { Services } from "@app/shared/constants/services";
import { bootstrapMicroservice } from "@app/shared/rpc/bootstrap-microservice";
import { CatalogServiceModule } from "./catalog-service.module";

void bootstrapMicroservice(CatalogServiceModule, Services.CATALOG);
