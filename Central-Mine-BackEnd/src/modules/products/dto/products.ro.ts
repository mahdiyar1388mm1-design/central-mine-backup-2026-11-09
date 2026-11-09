import { ApiProperty } from '@nestjs/swagger';
import { ProductRo } from './product.ro';

export class ProductsRo {
  @ApiProperty({ type: [ProductRo] })
  products: ProductRo[];

  @ApiProperty()
  count: number;
}
