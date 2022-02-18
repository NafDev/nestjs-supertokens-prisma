import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { validate } from './config/config.service';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';
import { EmailModule } from './email/email.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? 'production.env' : 'development.env',
      cache: true,
      expandVariables: true,
      validate,
      isGlobal: true,
    }),
    AppConfigModule,
    AuthModule.forRoot({
      // https://supertokens.com/docs/session/appinfo
      // These variables should by now be validated and initialised in config.service.ts
      connectionURI: process.env.SESSION_TOKENS_API_DOMAIN,
      appInfo: {
        appName: process.env.APP_NAME,
        apiDomain: process.env.API_DOMAIN,
        websiteDomain: process.env.WEB_DOMAIN,
      },
    }),
    DatabaseModule,
    UserModule,
    EmailModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
