import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UserRo } from 'src/modules/users/dto/user.ro';

/**
 * خروجی وارد شدن کاربر
 */
export class LoginRo {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public token: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserRo)
  @ApiProperty({ type: UserRo })
  public user: UserRo;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public refreshToken: string;
}
