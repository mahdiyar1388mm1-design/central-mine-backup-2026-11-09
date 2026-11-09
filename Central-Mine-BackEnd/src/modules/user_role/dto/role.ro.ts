import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsEnum, IsString } from 'class-validator';
import { PermissionTag } from '../types/permission-tag.enum';
import { Expose } from 'class-transformer';

/** خروجی نقش */
export class RoleRo {
  @ApiProperty()
  @IsString()
  @Expose()
  public readonly id: string;

  @ApiProperty()
  @IsString()
  @Expose()
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
  @Expose()
  public readonly permissions: PermissionTag[];
}
