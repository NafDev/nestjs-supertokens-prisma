import { Global, Module } from '@nestjs/common';
import { SmtpService } from './smtp.service';

@Global()
@Module({
	providers: [SmtpService],
	exports: [SmtpService]
})
export class EmailModule {}
