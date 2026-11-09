import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * کلاس متغیر‌های ورود به سامانه
 */
export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public readonly phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 5, { message: 'OTPCode Wrong Size' })
  @ApiProperty()
  public readonly OTPCode: string;
}
