import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import appConfig from './config/app.config';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';
import { EmailModule } from './email/email.module';
import { UserModule } from './api/users/users.module';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory() {
				return {
					pinoHttp: {
						transport: { target: 'pino-pretty' },
						redact: { paths: ['req.headers.cookie', 'res.headers["set-cookie"]'], remove: true }
					}
				};
			}
		}),
		AuthModule.forRoot({
			// https://supertokens.com/docs/session/appinfo
			connectionURI: appConfig.ST_CORE_URL,
			appInfo: {
				appName: appConfig.APP_NAME,
				apiDomain: appConfig.API_DOMAIN,
				websiteDomain: appConfig.WEB_DOMAIN,
				apiBasePath: '/'
			}
		}),
		DatabaseModule,
		UserModule,
		EmailModule,
		AdminModule
	],
	providers: [PrismaService]
})
export class AppModule {}
