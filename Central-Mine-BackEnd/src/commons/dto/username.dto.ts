import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * ورودی نام کاربری
 */
export class UsernameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly username: string;
}
