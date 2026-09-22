import { INestApplication, ValidationPipe } from "@nestjs/common";

/** HTTP-level configuration shared by main.ts and the e2e tests. */
export function configureGateway(app: INestApplication): void {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.enableShutdownHooks();
}
