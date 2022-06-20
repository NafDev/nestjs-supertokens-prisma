import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { Response } from 'express';
import { SessionContainer } from 'supertokens-node/recipe/session';
import appConfig from '../../config/app.config';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { createToken, sha265hex } from '../../util/utility';
import { UserLoginDto } from '../users/users.dto';
import { AccessTokenPayload } from './auth.types';
import { STSession } from './supertokens/supertokens.types';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async login(userLoginDto: UserLoginDto, resp: Response) {
		const user = await this.prisma.user.findUnique({
			where: { email: userLoginDto.email.toLowerCase() },
			select: { id: true, passwordHash: true, roles: true }
		});

		if (user !== null && user.passwordHash === null) {
			throw new BadRequestException('Please reset your password');
		}

		if (user !== null && (await compare(userLoginDto.password, user.passwordHash ?? ''))) {
			const payload: AccessTokenPayload = { roles: user.roles };

			await STSession.createNewSession(resp, user.id, payload);
			return;
		}

		throw new UnauthorizedException('Invalid email or password');
	}

	async logout(session: SessionContainer) {
		await session.revokeSession();
	}

	async sendPasswordResetTokenEmail(email: string) {
		const token = createToken();
		const timeLimitedToken = `${sha265hex(token)}#${(
			Date.now() +
			appConfig.PASSWORD_RESET_EXPIRY_MINS * 60_000
		).toString()}`;

		const user = await this.prisma.user.update({
			where: { email },
			data: { passwordResetToken: timeLimitedToken },
			select: { email: true, id: true }
		});

		if (user) {
			await this.smtpService.sendEmail(email, 'Reset your password', EmailTemplates.RESET_PASSWORD, {
				link: `${appConfig.WEB_DOMAIN}/auth/password-reset?token=${token}`
			});
		}

		this.logger.log(`User ${user.id} requested password reset`);
	}

	async performPasswordReset(token: string, newPassword: string) {
		const user = await this.prisma.user.findFirst({ where: { passwordResetToken: { startsWith: sha265hex(token) } } });

		if (user === null || Number.parseInt(user.passwordResetToken?.split('#').at(1) ?? '0', 10) <= Date.now()) {
			throw new UnauthorizedException('Invalid token. It may have expired.');
		}

		await STSession.revokeAllSessionsForUser(user.id);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { passwordHash: await hash(newPassword, appConfig.PASSWORD_SALT_ROUNDS), passwordResetToken: null }
		});

		this.logger.log(`User ${user.id} successfully performed password reset`);
	}
}
