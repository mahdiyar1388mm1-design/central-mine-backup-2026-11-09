import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Sku } from './entities/sku.entity';
import { Variation } from './entities/variation.entity';
import { Image } from './entities/image.entity';
import { Video } from './entities/video.entity';
import { Description } from './entities/description.entity';
import { Attribute } from './entities/attribute.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Sku,
      Variation,
      Image,
      Video,
      Description,
      Attribute,
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
