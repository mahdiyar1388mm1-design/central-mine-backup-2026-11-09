import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { winstonConsole } from './factory/winston.config';

dotenv.config();

/** کلاس بارگذار پیکره بندی اولیه ماژول‌های استفاده شده در زیرسیستم */
class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value as string;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return +this.getValue('HTTP_PORT', true);
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('DB_HOST'),
      port: +this.getValue('DB_PORT'),
      username: this.getValue('DB_USER'),
      password: this.getValue('DB_PASS'),
      database: this.getValue('DB_NAME'),
      entities: ['dist/**/*.entity.js'],
      migrationsTableName: 'migration',
      migrations: ['src/database/migrations/*.ts'],
      synchronize: this.getValue('DB_SYNC', false) === 'true',
      logging: this.getValue('DB_LOGGING', false) === 'true',
    };
  }

  public getJwtConfig() {
    return {
      secret: this.getValue('JWT_SECRET', true),
      signOptions: {
        expiresIn: this.getValue('JWT_EXPIRE_IN', false) || '60m',
      },
      refreshSignOptions: {
        expiresIn: this.getValue('JWT_REFRESH_EXPIRE_IN', false) || '30d',
      },
    };
  }

  public getWinstonConfig() {
    return winstonConsole();
  }

  public getKavenegarConfig() {
    return {
      apiKey: this.getValue('KAVENEGAR_API_KEY'),
      otpTemplate: this.getValue('KAVENEGAR_OTP_TEMPLATE', false) || 'otp',
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'HTTP_PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRE_IN',
  'JWT_REFRESH_EXPIRE_IN',
  'KAVENEGAR_API_KEY',
]);

export { configService };
