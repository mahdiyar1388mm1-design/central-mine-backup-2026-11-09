import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import {
  PermissionTag,
  PermissionTagValues,
} from '../types/permission-tag.enum';

/** ورودی‌های بررسی دسترسی کاربر به فعالیت */
export class CheckPermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public username: string;

  @ApiProperty()
  @IsEnum(PermissionTag, { each: true })
  @IsArray()
  @ArrayUnique()
  @ApiProperty({
    isArray: true,
    enum: PermissionTagValues,
  })
  public permissions: PermissionTag[];
}
