import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { AuthModuleConfig, ConfigInjectionToken } from './config.interface';
import { SupertokensService } from './supertokens/supertokens.service';

@Module({
	providers: [SupertokensService, AuthService],
	exports: [AuthService],
	controllers: [AuthController]
})
export class AuthModule implements NestModule {
	static forRoot({ connectionURI, apiKey, appInfo, apiBasePath }: AuthModuleConfig): DynamicModule {
		return {
			providers: [{ useValue: { appInfo, connectionURI, apiKey, apiBasePath }, provide: ConfigInjectionToken }],
			exports: [],
			imports: [],
			module: AuthModule
		};
	}

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('*');
	}
}
