import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 *ورودی شناسه
 */
export class IDDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly id: string;
}
