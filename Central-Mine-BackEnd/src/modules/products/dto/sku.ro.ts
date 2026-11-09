import { ApiProperty } from '@nestjs/swagger';
import { VariationRo } from './variation.ro';
import { ImageRo } from './image.ro';

export class SkuRo {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  upc?: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  purchasePrice: number;

  @ApiProperty({ required: false })
  basicPrice?: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ required: false })
  amountCommission?: number;

  @ApiProperty({ type: [VariationRo] })
  variations: VariationRo[];

  @ApiProperty({ type: [ImageRo] })
  images: ImageRo[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
