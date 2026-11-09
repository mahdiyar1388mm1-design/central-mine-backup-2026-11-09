import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateImageDto } from './create-image.dto';

export class UpdateImageDto extends PartialType(CreateImageDto) {
  /** اگر پر شود همین تصویر موجود ویرایش می‌شود؛ در غیر این صورت تصویر تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
