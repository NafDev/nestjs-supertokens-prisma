import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getAllCORSHeaders } from 'supertokens-node';
import { AppModule } from './app.module';
import { SupertokensExceptionFilter } from './auth/auth.filter';
import { HttpExceptionFilter } from './common/http.filter';
import { PrismaExceptionFilter } from './db/prisma/prisma.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('etag', false);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [configService.get('WEB_DOMAIN')],
    allowedHeaders: ['content-type', ...getAllCORSHeaders()],
    credentials: true,
  });

  app.useGlobalFilters(new SupertokensExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(configService.get('PORT'));
}

bootstrap();
