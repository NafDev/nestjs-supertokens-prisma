import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { PrismaService } from '../db/prisma/prisma.service';
import { UserLoginDto } from '../users/user.dto';
import { STSession, STSessionHandler } from './supertokens/supertokens.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(userLoginDto: UserLoginDto, res: any) {
    const user = await this.prisma.user.findFirst({
      where: { email: userLoginDto.email.toLowerCase() },
      select: { uid: true, passwordHash: true },
    });

    if (user !== null && (await compare(userLoginDto.password, user.passwordHash))) {
      await STSessionHandler.createNewSession(res, user.uid);
      return;
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  async logout(session: STSession) {
    await session.revokeSession();
    return;
  }
}
