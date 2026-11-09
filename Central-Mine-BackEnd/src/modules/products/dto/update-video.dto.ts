import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateVideoDto } from './create-video.dto';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  /** اگر پر شود همین فیلم موجود ویرایش می‌شود؛ در غیر این صورت تازه ساخته می‌شود */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
