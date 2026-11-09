import { ApiProperty } from '@nestjs/swagger';

export class DescriptionRo {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  paragraph?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  video?: string;
}
