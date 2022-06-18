import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
import { middleware } from 'supertokens-node/framework/express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	supertokensMiddleware: any;

	constructor() {
		this.supertokensMiddleware = middleware();
	}

	use(request: Request, resp: any, next: () => void) {
		return this.supertokensMiddleware(request, resp, next);
	}
}
