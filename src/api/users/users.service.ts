import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import appConfig from '../../config/app.config';
import { PrismaService } from '../../db/prisma/prisma.service';
import { CreateUserDto, UserInfoDto } from './users.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService) {}

	async createUser(createUserDto: CreateUserDto) {
		const user = await this.prisma.user.create({
			data: {
				email: createUserDto.email.toLowerCase(),
				passwordHash: await hash(createUserDto.password, appConfig.PASSWORD_SALT_ROUNDS),
				roles: 'USER'
			}
		});
	}

	async getUserInfo(id: string): Promise<UserInfoDto> {
		const user = await this.prisma.user.findUnique({ where: { id }, select: { email: true, id: true } });
		if (!user) throw new NotFoundException('User not found');

		return user;
	}
}
