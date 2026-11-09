import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

/** پاسخ استاندارد وب‌سرویس‌های کاوه‌نگار */
interface KavenegarResponse {
  return: { status: number; message: string };
  entries?: unknown[];
}

/**
 * سرویس ارسال پیامک از طریق کاوه‌نگار.
 * برای OTP از وب‌سرویس Verify Lookup استفاده می‌شود که مخصوص کدهای یکبار مصرف
 * است (بدون محدودیت هرزنامه و با سرعت تحویل بالاتر نسبت به ارسال پیامک عادی).
 * پیش‌نیاز: ساخت یک قالب (Template) در پنل کاوه‌نگار حاوی متغیر %token%.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject('KAVENEGAR_API_KEY') private readonly apiKey: string,
    @Inject('KAVENEGAR_OTP_TEMPLATE') private readonly otpTemplate: string,
  ) {}

  /** ارسال کد یکبار مصرف به شماره موبایل داده‌شده */
  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    const url = new URL(
      `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`,
    );
    url.searchParams.set('receptor', phoneNumber);
    url.searchParams.set('token', code);
    url.searchParams.set('template', this.otpTemplate);

    let response: Response;
    try {
      response = await fetch(url, { method: 'POST' });
    } catch (error) {
      this.logger.error(`Kavenegar request failed: ${error}`);
      throw new InternalServerErrorException('ارسال پیامک با خطا مواجه شد');
    }

    const data = (await response.json()) as KavenegarResponse;
    if (!response.ok || data.return?.status !== 200) {
      this.logger.error(
        `Kavenegar OTP send failed for ${phoneNumber}: ${data.return?.status} ${data.return?.message}`,
      );
      throw new InternalServerErrorException('ارسال پیامک با خطا مواجه شد');
    }
  }
}
