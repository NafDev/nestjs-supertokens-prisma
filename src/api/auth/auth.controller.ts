import { Body, Controller, Get, Post, Res, Session, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { EmailDto, PasswordDto, UserLoginDto } from '../users/users.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() userLoginDto: UserLoginDto, @Res({ passthrough: true }) resp: Response) {
		return this.authService.login(userLoginDto, resp);
	}

	@Get('logout')
	@UseGuards(AuthGuard)
	async logout(@Session() session: SessionContainer) {
		return this.authService.logout(session);
	}

	@Post('password/reset')
	async resetPassword(@Body() emailDto: EmailDto) {
		return this.authService.sendPasswordResetTokenEmail(emailDto.email);
	}

	@Post('password/reset/token')
	async performPasswordReset(@Body() passwordResetDto: PasswordDto) {
		const { token, password } = passwordResetDto;
		return this.authService.performPasswordReset(token, password);
	}
}
