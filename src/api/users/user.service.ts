import { Injectable, UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { STEmailVerificationHandler } from '../../auth/supertokens/supertokens.types';
import { AppConfig } from '../../config/config.service';
import { PrismaService } from '../../db/prisma/prisma.service';
import { nanoDbId } from '../../util/nanoid';
import { CreateUserDto, UserInfoDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly appConfig: AppConfig, private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        uid: nanoDbId(),
        email: createUserDto.email.toLowerCase(),
        passwordHash: await hash(createUserDto.password, this.appConfig.passwordSaltRounds),
      },
    });

    await STEmailVerificationHandler.createEmailVerificationToken(user.uid, user.email);
    // TODO Send email to user to verify account
  }

  async verifyUser(token: string) {
    const res = await STEmailVerificationHandler.verifyEmailUsingToken(token);
    if (res.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
      throw new UnauthorizedException('Invalid verification token');
    }
  }

  async getUserInfo(uid: string): Promise<UserInfoDto> {
    return await this.prisma.user.findFirst({ where: { uid }, select: { email: true, uid: true } });
  }
}
