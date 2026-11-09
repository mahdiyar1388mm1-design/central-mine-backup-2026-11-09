import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** ورودی از جنس کاربر  */
export class UserInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly role: string;
}
