/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { IsEmail, IsEnum, IsPort, IsUrl, Matches, Min, validateSync } from 'class-validator';

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, whitelist: true });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment) NODE_ENV: string = 'development';
  @IsPort() PORT: string = '3000';

  @Min(10) PASSWORD_SALT_ROUNDS: number = 10;

  @Matches(/^postgresql\:\/\//) DATABASE_URL: string;

  @IsUrl({ require_tld: false }) SESSION_TOKENS_API_DOMAIN: string = 'http://127.0.0.1:3567/';
  @Matches(/[A-Za-z ]/) APP_NAME: string = 'App in development';
  @IsUrl({ require_tld: false }) API_DOMAIN: string = `http://localhost:${process.env.PORT}`;
  @IsUrl({ require_tld: false }) WEB_DOMAIN: string = `http://localhost:8080`;

  @IsUrl() SMTP_HOST: string;
  @IsPort() SMTP_PORT: string | number = 465;
  SMTP_USER: string;
  SMTP_PASS: string;
  @IsEmail() SENDFROM_EMAIL: string;
}

@Injectable()
export class AppConfig {
  constructor(private readonly configService: ConfigService) {}

  get env(): Environment {
    return this.configService.get('NODE_ENV');
  }

  get port(): number {
    return this.configService.get('PORT');
  }

  get appName(): string {
    return this.configService.get('APP_NAME');
  }

  get webDomain(): string {
    return this.configService.get('WEB_DOMAIN');
  }

  get passwordSaltRounds(): number {
    return this.configService.get('PASSWORD_SALT_ROUNDS');
  }

  get smtpConnection() {
    const port = this.configService.get<string | number>('SMTP_PORT');
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: typeof port === 'string' ? parseInt(port, 10) : port,
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
    };
  }

  get sendFromEmail() {
    return this.configService.get('SENDFROM_EMAIL');
  }
}
