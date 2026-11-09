import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  public readonly userID: string; //NOTE - fill from token

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly refreshToken: string;
}
