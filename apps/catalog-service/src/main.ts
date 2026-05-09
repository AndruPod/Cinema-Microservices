import { NestFactory } from "@nestjs/core";
import { CatalogServiceModule } from "./catalog-service.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { LoggingInterceptor } from "@app/shared/interceptors/logging.interceptor";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const host = process.env.CATALOG_SERVICE_LISTEN_HOST || "0.0.0.0";
    const port = parseInt(String(process.env.CATALOG_SERVICE_PORT), 10) || 3001;

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        CatalogServiceModule,
        {
            transport: Transport.TCP,
            options: {
                host: host,
                port: port,
            },
        },
    );

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.listen().then(() => {
        console.log(`Catalog microservice listening to port: ${port}`);
    });
}
bootstrap();
