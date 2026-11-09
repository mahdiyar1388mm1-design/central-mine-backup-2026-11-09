import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateVariationDto } from './create-variation.dto';
import { CreateImageDto } from './create-image.dto';

export class CreateSkuDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  upc?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  /** قیمت فروش */
  @ApiProperty()
  @IsNumber()
  price: number;

  /** قیمت خرید */
  @ApiProperty()
  @IsNumber()
  purchasePrice: number;

  /** قیمت پایه (قبل از تخفیف) */
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  basicPrice?: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  amountCommission?: number;

  @ApiProperty({ required: false, type: [CreateVariationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationDto)
  @IsOptional()
  variations?: CreateVariationDto[];

  @ApiProperty({ required: false, type: [CreateImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  @IsOptional()
  images?: CreateImageDto[];
}
