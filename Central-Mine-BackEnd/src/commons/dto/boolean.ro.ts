import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BooleanRo {
  @ApiProperty()
  @IsBoolean()
  public boolean: boolean;
}
