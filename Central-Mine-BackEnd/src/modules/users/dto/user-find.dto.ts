import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UserFindDto {
  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9+]{8,20}$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ required: false, enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
