import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateAttributeDto } from './create-attribute.dto';

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {
  /** اگر پر شود همین ویژگی موجود ویرایش می‌شود؛ در غیر این صورت تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
