import { NestFactory } from "@nestjs/core";
import { ApiGatewayModule } from "./api-gateway.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./rpc-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(ApiGatewayModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>("API_GATEWAY_PORT") || 3000;

    app.useGlobalFilters(new AllExceptionsFilter())

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    await app.listen(port);

    console.log(`App listening on port ${port}`);
}
bootstrap();
