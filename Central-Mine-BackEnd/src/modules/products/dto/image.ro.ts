import { ApiProperty } from '@nestjs/swagger';

export class ImageRo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  createdAt: Date;
}
