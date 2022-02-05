/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { IsEnum, IsPort, IsUrl, Matches, Min, validateSync } from 'class-validator';

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
  @IsEnum(Environment)
  NODE_ENV: string = 'development';

  @IsPort()
  PORT: string = '3000';

  @Min(10)
  PASSWORD_SALT_ROUNDS: number = 10;

  @Matches(/^postgresql\:\/\//)
  DATABASE_URL: string;

  @IsUrl({ require_tld: false })
  SESSION_TOKENS_API_DOMAIN: string = 'http://127.0.0.1:3567/';

  @Matches(/[A-Za-z ]/)
  APP_NAME: string = 'App in development';

  @IsUrl({ require_tld: false })
  API_DOMAIN: string = `http://localhost:${process.env.PORT}`;

  @IsUrl({ require_tld: false })
  WEB_DOMAIN: string = `http://localhost:8080`;
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

  get passwordSaltRounds(): number {
    return this.configService.get('PASSWORD_SALT_ROUNDS');
  }
}
