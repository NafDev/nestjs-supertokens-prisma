import { Body, Controller, Get, Param, Post, Session, UseGuards } from '@nestjs/common';
import { STSession } from 'src/auth/supertokens/supertokens.types';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getUser(@Session() session: STSession) {
    return this.userService.getUserInfo(session.getUserId());
  }

  @Post('create')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('verify/:token')
  verifyUserEmail(@Param('token') token: string) {
    return this.userService.verifyUser(token);
  }
}
