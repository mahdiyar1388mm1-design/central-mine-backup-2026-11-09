import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/** خروجی تابع بررسی دسترسی کاربر به فعالیت */
export class CheckPermissionRo {
  @ApiProperty({ description: 'دسترسی کاربر مجاز است یا خیر' })
  @IsNotEmpty()
  @IsBoolean()
  public readonly isAccess: boolean;
}
