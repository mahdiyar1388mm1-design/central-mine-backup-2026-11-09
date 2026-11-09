import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { configService } from 'src/config.service';
import { UsersModule } from 'src/modules/users/users.module';
import { SmsModule } from 'src/modules/sms/sms.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/** ماژول احراز هویت برای معماری مونولیت */
@Module({
  imports: [
    UsersModule,
    SmsModule,
    JwtModule.register({
      secret: configService.getJwtConfig().secret,
      signOptions: configService.getJwtConfig().signOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'JWT_REFRESH_EXPIRE_IN',
      useValue: configService.getJwtConfig().refreshSignOptions.expiresIn,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
