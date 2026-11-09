import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSkuDto } from './create-sku.dto';
import { UpdateVariationDto } from './update-variation.dto';
import { UpdateImageDto } from './update-image.dto';

// variations/images پایین با نوع Update*Dto (که id هم دارند) بازتعریف
// می‌شوند؛ اول با OmitType از پایه حذفشان می‌کنیم تا با نوع Create*Dto[]
// ناسازگار نشوند.
class SkuBaseWithoutChildren extends OmitType(CreateSkuDto, [
  'variations',
  'images',
] as const) {}

export class UpdateSkuDto extends PartialType(SkuBaseWithoutChildren) {
  /** اگر پر شود همین SKU موجود ویرایش می‌شود؛ در غیر این صورت SKU تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ required: false, type: [UpdateVariationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariationDto)
  @IsOptional()
  variations?: UpdateVariationDto[];

  @ApiProperty({ required: false, type: [UpdateImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImageDto)
  @IsOptional()
  images?: UpdateImageDto[];
}
