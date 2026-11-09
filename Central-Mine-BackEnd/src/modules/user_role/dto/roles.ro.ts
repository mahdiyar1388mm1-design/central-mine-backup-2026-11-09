import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RoleRo } from './role.ro';

/** خروجی نقش‌ها */
export class RolesRo {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleRo)
  @ApiProperty({ type: [RoleRo] })
  public readonly rolesRo: RoleRo[];
}
