import { Catch, Logger, RpcExceptionFilter } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { RpcErrorPayload, toRpcErrorPayload } from "./rpc-error";

/**
 * Lets microservice code throw regular Nest HTTP exceptions
 * (NotFoundException, ConflictException, ...) and sends them to the caller
 * as a consistent {@link RpcErrorPayload}. Unexpected errors are logged and
 * reported as a generic 500 without leaking internals.
 */
@Catch()
export class RpcExceptionsFilter implements RpcExceptionFilter<unknown> {
    private readonly logger = new Logger(RpcExceptionsFilter.name);

    catch(exception: unknown): Observable<never> {
        const payload = toRpcErrorPayload(exception);

        if (payload.statusCode >= 500) {
            this.logger.error(
                exception instanceof Error ? exception.stack : exception,
            );
        }

        return throwError((): RpcErrorPayload => payload);
    }
}
