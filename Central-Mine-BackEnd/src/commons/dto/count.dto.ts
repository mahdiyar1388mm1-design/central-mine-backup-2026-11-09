import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/** ورودی از جنس تعداد */
export class CountDto {
  @IsNumber()
  @ApiProperty()
  public readonly count: number;
}
