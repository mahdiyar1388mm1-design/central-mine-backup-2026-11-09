import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateDescriptionDto } from './create-description.dto';

export class UpdateDescriptionDto extends PartialType(CreateDescriptionDto) {
  /** اگر پر شود همین بخش توضیح موجود ویرایش می‌شود؛ در غیر این صورت تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
