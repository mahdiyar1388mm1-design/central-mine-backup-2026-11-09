import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ArrayUnique } from 'class-validator';

/** ورودی نقش‌های یک کاربر */
export class UserRoleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public username: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayUnique()
  @ApiProperty()
  public roleIds: string[];
}
