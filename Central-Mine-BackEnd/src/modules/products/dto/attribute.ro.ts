import { ApiProperty } from '@nestjs/swagger';

export class AttributeRo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;
}
