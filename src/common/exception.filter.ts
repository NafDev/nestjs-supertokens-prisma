import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		if (exception instanceof Error) {
			this.logger.error('Uncaught error', exception.stack);
		} else {
			this.logger.error('Uncaught unknown', exception);
		}

		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const responseBody = exception instanceof HttpException ? { message: exception.message } : undefined;

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
