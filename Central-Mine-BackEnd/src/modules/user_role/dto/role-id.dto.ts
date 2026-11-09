import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** ورودی آی‌دی نقش برای مشخص کردن نقش */
export class RoleIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly id: string;
}
