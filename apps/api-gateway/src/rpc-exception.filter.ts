import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json(exception.getResponse());
        }

        const errorResponse = exception.response || exception;
        const message = errorResponse.message || exception.message || 'Internal server error';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (message.includes('already exists')) status = HttpStatus.CONFLICT;
        if (message.includes('do not match')) status = HttpStatus.BAD_REQUEST;

        response.status(status).json({
            statusCode: status,
            message: message,
            error: 'Microservice Error',
        });
    }
}