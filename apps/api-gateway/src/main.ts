import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ApiGatewayModule } from "./api-gateway.module";
import { configureGateway } from "./setup";

async function bootstrap() {
    const app = await NestFactory.create(ApiGatewayModule);
    configureGateway(app);

    const port = app.get(ConfigService).getOrThrow<number>("API_GATEWAY_PORT");
    await app.listen(port);

    new Logger("Bootstrap").log(`API gateway listening on port ${port}`);
}

void bootstrap();
