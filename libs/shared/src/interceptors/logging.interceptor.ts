import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from "@nestjs/common";
import { TcpContext } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Logs every handled message pattern with its duration and outcome.
 * Payloads are intentionally not logged: they may contain credentials.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger("Microservice");

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const pattern = JSON.stringify(
            context.switchToRpc().getContext<TcpContext>().getPattern(),
        );

        return next.handle().pipe(
            tap({
                next: () =>
                    this.logger.log(`${pattern} OK +${Date.now() - start}ms`),
                error: (error: { statusCode?: number }) =>
                    this.logger.warn(
                        `${pattern} FAILED (${error?.statusCode ?? "error"}) +${Date.now() - start}ms`,
                    ),
            }),
        );
    }
}
