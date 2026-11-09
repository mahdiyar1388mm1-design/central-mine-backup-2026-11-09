import { ApiProperty } from '@nestjs/swagger';

export class VariationRo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  value: string;
}
