import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateVariationDto } from './create-variation.dto';

export class UpdateVariationDto extends PartialType(CreateVariationDto) {
  /** اگر پر شود همین ویژگی موجود ویرایش می‌شود؛ در غیر این صورت تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
