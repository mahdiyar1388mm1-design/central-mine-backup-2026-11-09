import { PermissionTag } from '../types/permission-tag.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  ArrayUnique,
  IsEnum,
  IsArray,
} from 'class-validator';

/** ورودی‌های ایجاد نقش */
export class RoleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public readonly name: string;

  @ApiProperty({
    type: 'array',
    items: {
      enum: Object.keys(PermissionTag),
    },
  })
  @ArrayUnique()
  @IsArray()
  @IsEnum(PermissionTag, { each: true })
  public readonly permissions: PermissionTag[];
}
