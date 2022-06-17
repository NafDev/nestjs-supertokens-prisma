import { Body, Controller, Post, Res, Session, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { UserLoginDto } from '../users/user.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { STSession } from './supertokens/supertokens.types';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() userLoginDto: UserLoginDto, @Res({ passthrough: true }) resp: Response) {
		return this.authService.login(userLoginDto, resp);
	}

	@Post('logout')
	@UseGuards(AuthGuard)
	async logout(@Session() session: SessionContainer) {
		return this.authService.logout(session);
	}
}
