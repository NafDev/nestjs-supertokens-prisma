import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
	providers: [UserService],
	controllers: [UserController]
})
export class UserModule {}
