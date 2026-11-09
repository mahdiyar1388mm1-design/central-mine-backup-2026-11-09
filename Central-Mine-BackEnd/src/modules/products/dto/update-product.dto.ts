import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { UpdateSkuDto } from './update-sku.dto';
import { UpdateVideoDto } from './update-video.dto';
import { UpdateDescriptionDto } from './update-description.dto';
import { UpdateAttributeDto } from './update-attribute.dto';

// این چهار فیلد پایین دوباره با نوع Update*Dto (که id هم دارند) بازتعریف
// می‌شوند؛ برای اینکه TypeScript نوع بازتعریف‌شده را با نوع Create*Dto[] پایه
// ناسازگار نداند، اول با OmitType از پایه حذفشان می‌کنیم.
class ProductBaseWithoutChildren extends OmitType(CreateProductDto, [
  'skus',
  'videos',
  'descriptions',
  'attributes',
] as const) {}

export class UpdateProductDto extends PartialType(
  ProductBaseWithoutChildren,
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  /** هر SKU که شناسه‌اش با یکی از SKUهای موجود یکی باشد ویرایش می‌شود، بدون
   * شناسه تازه ساخته می‌شود، و SKU موجودی که در آرایه نیاید حذف می‌شود؛
   * یعنی برای مثلاً فقط عوض کردن عکس‌های یک SKU لازم نیست بقیه‌ی SKUها را
   * دوباره بفرستی. */
  @ApiProperty({ required: false, type: [UpdateSkuDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkuDto)
  @IsOptional()
  skus?: UpdateSkuDto[];

  @ApiProperty({ required: false, type: [UpdateVideoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVideoDto)
  @IsOptional()
  videos?: UpdateVideoDto[];

  @ApiProperty({ required: false, type: [UpdateDescriptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDescriptionDto)
  @IsOptional()
  descriptions?: UpdateDescriptionDto[];

  @ApiProperty({ required: false, type: [UpdateAttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAttributeDto)
  @IsOptional()
  attributes?: UpdateAttributeDto[];
}
