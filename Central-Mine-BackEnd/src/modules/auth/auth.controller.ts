import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginRo } from './dto/login.ro';
import { AuthGuard } from 'src/guards/auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOTPDto } from './dto/send-otp.dto';
import { BooleanRo } from 'src/commons/dto/boolean.ro';
import { ErrorsInterceptor } from 'src/interceptors/errors.interceptor';
import { UserActivityInterceptor } from 'src/interceptors/user-activity.interceptor';

/**
 * مسیریاب و کنترل‌کننده‌ی http ارتباط با بخش احراز هویت
 */
@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ErrorsInterceptor, UserActivityInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'ورود با شماره موبایل و کد یکبار مصرف',
    description: 'اعتبارسنجی کد OTP و صدور access/refresh token.',
  })
  @ApiOkResponse({
    description: 'The Token has been successfully generated.',
    type: LoginRo,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginRo> {
    return this.authService.login(loginDto);
  }

  @Post('send_otp')
  @ApiOperation({
    summary: 'ارسال کد یکبار مصرف',
    description: 'ارسال کد OTP به شماره موبایل داده‌شده جهت ورود/ثبت‌نام.',
  })
  @ApiOkResponse({
    description: 'The OTP code has been successfully sent.',
    type: BooleanRo,
  })
  async sendOtp(@Body() sendOTPDto: SendOTPDto): Promise<BooleanRo> {
    return this.authService.sendOtp(sendOTPDto);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'تمدید توکن دسترسی',
    description: 'صدور access token جدید با استفاده از refresh token معتبر.',
  })
  @ApiOkResponse({
    description: 'Refresh the access token using the refresh token.',
    type: LoginRo,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: any,
  ): Promise<LoginRo> {
    const userID = request.headers['user']['id'];
    return this.authService.refreshAccessToken({
      userID,
      ...refreshTokenDto,
    });
  }
}
