import { Body, Controller, Post, Res, Session, UseGuards } from '@nestjs/common';
import { UserLoginDto } from '../users/user.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { STSession } from './supertokens/supertokens.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto, @Res({ passthrough: true }) res) {
    return this.authService.login(userLoginDto, res);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Session() session: STSession) {
    return this.authService.logout(session);
  }
}
