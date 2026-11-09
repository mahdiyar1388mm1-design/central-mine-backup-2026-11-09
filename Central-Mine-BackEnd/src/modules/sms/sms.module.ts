import { Module } from '@nestjs/common';
import { configService } from 'src/config.service';
import { SmsService } from './sms.service';

/** ماژول ارسال پیامک (کاوه‌نگار) */
@Module({
  providers: [
    SmsService,
    {
      provide: 'KAVENEGAR_API_KEY',
      useValue: configService.getKavenegarConfig().apiKey,
    },
    {
      provide: 'KAVENEGAR_OTP_TEMPLATE',
      useValue: configService.getKavenegarConfig().otpTemplate,
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
