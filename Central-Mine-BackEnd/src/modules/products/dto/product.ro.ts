import { ApiProperty } from '@nestjs/swagger';
import { SkuRo } from './sku.ro';
import { VideoRo } from './video.ro';
import { DescriptionRo } from './description.ro';
import { AttributeRo } from './attribute.ro';

export class ProductRo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  shopID?: string;

  @ApiProperty({ required: false })
  ownerID?: string;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false })
  sellerDescription?: string;

  @ApiProperty({ required: false })
  length?: number;

  @ApiProperty({ required: false })
  width?: number;

  @ApiProperty({ required: false })
  height?: number;

  @ApiProperty()
  visible: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  seen: number;

  @ApiProperty({ type: [SkuRo] })
  skus: SkuRo[];

  @ApiProperty({ type: [VideoRo] })
  videos: VideoRo[];

  @ApiProperty({ type: [DescriptionRo] })
  descriptions: DescriptionRo[];

  @ApiProperty({ type: [AttributeRo] })
  attributes: AttributeRo[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
