import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import supertokens from 'supertokens-node';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../../email/smtp.service';
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
						const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

						if (!user) {
							throw new Error('Could not find user');
						}

						return user.email;
					},

					async createAndSendCustomEmail(user, emailVerificationURLWithToken) {
						if (!(await STEmailVerification.isEmailVerified(user.id, user.email))) {
							await smtpService.sendEmail(user.email, 'Verify your email address', EmailTemplates.VERIFY_USER, {
								link: emailVerificationURLWithToken
							});
						}
					},

					override: {
						functions(originalImpl) {
							return {
								...originalImpl,
								async isEmailVerified(input) {
									const user = await prisma.user.findUnique({
										where: { id: input.userId },
										select: { verified: true }
									});

									return user?.verified ?? false;
								},
								async unverifyEmail(input) {
									await prisma.user.update({
										where: { id: input.userId },
										data: { verified: false },
										select: {}
									});
									return { status: 'OK' };
								},
								async verifyEmailUsingToken(input) {
									try {
										const cdi = axios.create({
											baseURL: config.connectionURI,
											method: 'POST',
											headers: {
												rid: 'emailverification',
												'cdi-version': appConfig.ST_CDI_VERSION // eslint-disable-line @typescript-eslint/naming-convention
											}
										});

										// Verify an email
										const verify = await cdi.post<
											| { status: 'OK'; userId: string; email: string }
											| { status: 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR' }
										>('recipe/user/email/verify', {
											method: 'token',
											token: input.token
										});

										if (verify.data.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
											return { status: 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR' };
										}

										const { userId } = verify.data;
										const { email } = verify.data;

										// Set user enabled in our DB
										await prisma.user.update({ where: { id: userId }, data: { verified: true } });

										// Remove all tokens from ST
										await cdi.post('/recipe/user/email/verify/token/remove', { userId, email });

										// Removo verifed email from ST
										await cdi.post('/recipe/user/email/verify/remove', { userId, email });

										return { status: 'OK', user: { id: userId, email } };
									} catch {
										throw new InternalServerErrorException('Something went wrong while verifing your email');
									}
								}
							};
						}
					}
				})
			]
		});
	}
}
