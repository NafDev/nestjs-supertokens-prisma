import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { getAllCORSHeaders } from 'supertokens-node';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SupertokensExceptionFilter } from './api/auth/auth.filter';
import { AllExceptionsFilter } from './common/exception.filter';
import appConfig from './config/app.config';
import { PrismaExceptionFilter } from './db/prisma/prisma.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	app.useLogger(app.get(Logger));
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	app.getHttpAdapter().getInstance().set('etag', false);
	app.use(helmet());
	app.enableCors({
		origin: [appConfig.WEB_DOMAIN],
		allowedHeaders: ['content-type', ...getAllCORSHeaders()],
		credentials: true
	});

	app.useGlobalFilters(new SupertokensExceptionFilter());
	app.useGlobalFilters(new PrismaExceptionFilter());
	app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	await app.listen(appConfig.PORT);
}

void bootstrap();
