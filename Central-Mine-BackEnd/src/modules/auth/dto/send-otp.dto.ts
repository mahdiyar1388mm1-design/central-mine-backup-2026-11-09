import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

/** ورودی از جنس شماره موبایل */
export class SendOTPDto {
  @ApiProperty({ maxLength: 11 })
  @Matches(/(^|,)(09[0-9]{9}|1[3-9][0-9]{9})|(1[0-9]{10})+$/)
  @IsString()
  @IsNotEmpty()
  public phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public readonly referralCode?: string;
}
