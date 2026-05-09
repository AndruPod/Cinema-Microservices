import { NestFactory } from "@nestjs/core";
import { AuthServiceModule } from "./auth-service.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { LoggingInterceptor } from "@app/shared/interceptors/logging.interceptor";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {

    const host = process.env.AUTH_SERVICE_LISTEN_HOST || "0.0.0.0";
    const port = parseInt(String(process.env.AUTH_SERVICE_PORT), 10) || 3003;

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthServiceModule,
        {
            transport: Transport.TCP,
            options: {
                port: port,
                host: host,
            },
        },
    );

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.listen().then(() => {
        console.log(`Auth microservice listening to port: ${port}`);
    });
}
bootstrap();
