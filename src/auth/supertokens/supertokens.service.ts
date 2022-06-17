import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { AuthModuleConfig, ConfigInjectionToken } from '../config.interface';
import { STEmailVerification, STSession } from './supertokens.types';

@Injectable()
export class SupertokensService {
	constructor(
		@Inject(ConfigInjectionToken) private readonly config: AuthModuleConfig,
		private readonly prisma: PrismaService,
		private readonly smtpService: SmtpService
	) {
		supertokens.init({
			appInfo: config.appInfo,
			supertokens: { connectionURI: config.connectionURI },
			recipeList: [
				STSession.init({ antiCsrf: 'NONE', cookieSameSite: 'strict' }),
				STEmailVerification.init({
					async getEmailForUserId(userId) {
						const user = await prisma.user.findFirst({ where: { uid: userId }, select: { email: true } });
						if (!user) {
							throw new Error('Could not find user');
						}

						return user.email;
					},
					async createAndSendCustomEmail(user, emailVerificationURLWithToken) {
						if (!(await STEmailVerification.isEmailVerified(user.id, user.email))) {
							await smtpService.sendEmail(user.email, 'Verify your email address', EmailTemplates.VERIFY_USER, {
								verifyLink: emailVerificationURLWithToken
							});
						}
					}
				})
			]
		});
	}
}
