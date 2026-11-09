import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFindDto } from './dto/product-find.dto';
import { ProductRo } from './dto/product.ro';
import { ProductsRo } from './dto/products.ro';
import { IDDto } from 'src/commons/dto/uuid.dto';

/**
 * مسیریاب و کنترل کننده ارتباط http با کاتالوگ محصولات فروشگاه
 */
@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'ثبت محصول جدید' })
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
    type: ProductRo,
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductRo> {
    return this.productsService.create(createProductDto);
  }

  @Patch()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'ویرایش محصول' })
  @ApiOkResponse({
    description: 'The product has been successfully updated.',
    type: ProductRo,
  })
  async update(@Body() updateProductDto: UpdateProductDto): Promise<ProductRo> {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'جستجوی محصولات',
    description:
      'جستجوی محصولات بر اساس نام، فروشگاه یا دسته‌بندی؛ صفحه‌بندی‌شده.',
  })
  @ApiOkResponse({
    description: 'The products have been successfully found.',
    type: ProductsRo,
  })
  async find(@Query() productFindDto: ProductFindDto): Promise<ProductsRo> {
    return this.productsService.find(productFindDto);
  }

  @Get('by-id/:id')
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'دریافت یک محصول بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiOkResponse({
    description: 'The product has been successfully found.',
    type: ProductRo,
  })
  async getById(@Param() idDto: IDDto): Promise<ProductRo> {
    return this.productsService.view(idDto);
  }

  @Delete(':id')
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'حذف محصول (نرم)' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiOkResponse({ description: 'The product has been successfully removed.' })
  async remove(@Param() idDto: IDDto): Promise<void> {
    await this.productsService.remove(idDto.id);
  }
}
