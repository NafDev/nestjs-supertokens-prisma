import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { STEmailVerification } from '../auth/supertokens/supertokens.types';
import appConfig from '../config/app.config';
import { PrismaService } from '../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../email/smtp.service';
import { nanoDbId } from '../util/nanoid';
import { CreateUserDto, UserInfoDto } from './user.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async createUser(createUserDto: CreateUserDto) {
		const user = await this.prisma.user.create({
			data: {
				uid: nanoDbId(),
				email: createUserDto.email.toLowerCase(),
				passwordHash: await hash(createUserDto.password, appConfig.PASSWORD_SALT_ROUNDS)
			}
		});

		/// await this.sendVerificationEmail({ uid: user.uid, email: user.email });
	}

	/* A
  async sendVerificationEmail(userInfo: Partial<UserInfoDto>) {
    let user: UserInfoDto;
    if (userInfo.uid !== undefined && userInfo.email !== undefined) {
      user = { uid: userInfo.uid, email: userInfo.email };
    } else {
      const where = userInfo.uid !== undefined ? { uid: userInfo.uid } : { email: userInfo.email };
      user = await this.prisma.user.findFirst({ where, select: { email: true, uid: true } });
    }

    await STEmailVerification.revokeEmailVerificationTokens(user.uid, user.email);

    const verifyToken = await STEmailVerification.createEmailVerificationToken(user.uid, user.email);
    if (verifyToken.status === 'OK') {
      const verifyLink = this.appConfig.webDomain + `/verify/${verifyToken.token}`;
      this.smtpService.sendEmail(user.email, 'Verify your email address', EmailTemplates.VERIFY_USER, { verifyLink });
    }
  }
  async verifyUser(token: string) {
    const res = await STEmailVerification.verifyEmailUsingToken(token);
    if (res.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
      throw new ForbiddenException('Invalid verification token');
    }
    
    await this.prisma.user.update({ where: { uid: res.user.id }, data: { verified: true } });
  }
  
  */
	async getUserInfo(uid: string): Promise<UserInfoDto> {
		return this.prisma.user.findFirst({ where: { uid }, select: { email: true, uid: true } });
	}
}
