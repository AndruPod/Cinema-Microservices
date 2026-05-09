import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger("Microservice");

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const rpcContext = context.switchToRpc();
        const data = rpcContext.getData();

        const pattern = JSON.stringify(
            context.switchToRpc().getContext().getPattern(),
        );

        return next.handle().pipe(
            tap((response) => {
                const duration = Date.now() - start;
                this.logger.log(
                    `Pattern: ${pattern} | Duration: ${duration}ms | Payload: ${JSON.stringify(data)}`,
                );
            }),
        );
    }
}
