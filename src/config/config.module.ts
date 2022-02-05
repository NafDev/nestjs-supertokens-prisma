import { Global, Module } from '@nestjs/common';
import { AppConfig } from './config.service';

@Global()
@Module({
  providers: [AppConfig],
  exports: [AppConfig],
})
export class AppConfigModule {}
