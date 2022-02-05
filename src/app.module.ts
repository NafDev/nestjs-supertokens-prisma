import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './api/users/user.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { validate } from './config/config.service';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';

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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
