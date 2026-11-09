import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginRo } from './dto/login.ro';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOTPDto } from './dto/send-otp.dto';
import { BooleanRo } from 'src/commons/dto/boolean.ro';
import { UserInfoDto } from 'src/commons/dto/user-info.dto';
import { UserRo } from 'src/modules/users/dto/user.ro';

@Injectable()
export class AuthService {
  /** ذخیره‌ی موقت کد یک‌بارمصرف؛ کلید شماره موبایل، مقداد کد OTP و زمان انقضا. */
  private readonly otpStore = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject('JWT_REFRESH_EXPIRE_IN')
    private readonly refreshExpiresIn: string,
  ) {}

  async sendOtp(dto: SendOTPDto): Promise<BooleanRo> {
    // TODO: Kavenegar's Verify Lookup template got rejected pending Enamad
    // approval, so real SMS sending is on hold — OTP is pinned to a fixed
    // dev code again for now. Once Enamad/Kavenegar are sorted, re-inject
    // SmsService and go back to
    // `const code = Math.floor(10000 + Math.random() * 90000).toString();
    // await this.smsService.sendOtp(dto.phoneNumber, code);`.
    const code = '12345';
    this.otpStore.set(dto.phoneNumber, {
      code,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });
    return { boolean: true };
  }

  async login(dto: LoginDto): Promise<LoginRo> {
    const entry = this.otpStore.get(dto.phoneNumber);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('OTP expired or not sent');
    }
    if (entry.code !== dto.OTPCode) {
      throw new UnauthorizedException('Invalid OTP code');
    }
    this.otpStore.delete(dto.phoneNumber);

    let user: User;
    try {
      const ro = await this.usersService.getByPhoneNumber({
        phoneNumber: dto.phoneNumber,
      });
      user = await this.toEntity(ro);
    } catch (error) {
      if (error instanceof NotFoundException) {
        user = (await this.usersService.create({
          phoneNumber: dto.phoneNumber,
        })) as unknown as User;
      } else {
        throw error;
      }
    }

    const payload = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      token,
      user: await this.usersService.getById({ id: user.id }),
      refreshToken,
    };
  }

  async verify(token: string): Promise<UserInfoDto> {
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return {
      id: decoded.id,
      phoneNumber: decoded.phoneNumber,
      role: decoded.role,
    };
  }

  async refreshAccessToken(dto: RefreshTokenDto): Promise<LoginRo> {
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.getById({ id: decoded.id });
    if (!user.isActive) {
      throw new UnauthorizedException('User is suspended');
    }

    const payload = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshExpiresIn,
    });

    return { token, user, refreshToken };
  }

  private async toEntity(ro: UserRo): Promise<User> {
    return {
      id: ro.id,
      phoneNumber: ro.phoneNumber,
      name: ro.name,
      role: ro.role,
      isActive: ro.isActive,
      lastLoginAt: ro.lastLoginAt,
      createdAt: ro.createdAt,
      updatedAt: ro.updatedAt,
    } as unknown as User;
  }
}
