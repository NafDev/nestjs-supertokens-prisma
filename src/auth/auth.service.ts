import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { PrismaService } from '../db/prisma/prisma.service';
import { UserLoginDto } from '../users/user.dto';
import { AccessTokenPayload } from './auth.types';
import { STSession } from './supertokens/supertokens.types';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly prisma: PrismaService) {}

	async login(userLoginDto: UserLoginDto, resp: Response) {
		const user = await this.prisma.user.findFirst({
			where: { email: userLoginDto.email.toLowerCase() },
			select: { uid: true, passwordHash: true, roles: true }
		});

		if (user !== null && (await compare(userLoginDto.password, user.passwordHash))) {
			const payload: AccessTokenPayload = {
				roles: user.roles.map((role) => role.roleId)
			};
			await STSession.createNewSession(resp, user.uid, payload);
			return;
		}

		throw new UnauthorizedException('Invalid email or password');
	}

	async logout(session: SessionContainer) {
		await session.revokeSession();
	}
}
