import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

export class CreateUserDto {
  @IsEmail() email: string;
  @MinLength(6) password: string;
}

export class UserInfoDto {
  uid: string;
  email: string;
}

export class EmailDto {
  @IsEmail() email: string;
}
