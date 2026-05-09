import { NestFactory } from "@nestjs/core";
import { OrderServiceModule } from "./order-service.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
    const host = process.env.ORDER_SERVICE_LISTEN_HOST || "0.0.0.0";
    const port = parseInt(String(process.env.ORDER_SERVICE_PORT), 10) || 3002;

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        OrderServiceModule,
        {
            transport: Transport.TCP,
            options: {
                host: host,
                port: port,
            },
        },
    );
    await app.listen().then(() => {
        console.log(`Order microservice listening to port: ${port}`);
    });
}
bootstrap();
