import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSkuDto } from './create-sku.dto';
import { CreateVideoDto } from './create-video.dto';
import { CreateDescriptionDto } from './create-description.dto';
import { CreateAttributeDto } from './create-attribute.dto';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopID?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ownerID?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sellerDescription?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  length?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  width?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @ApiProperty({ type: [CreateSkuDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkuDto)
  skus: CreateSkuDto[];

  @ApiProperty({ required: false, type: [CreateVideoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVideoDto)
  @IsOptional()
  videos?: CreateVideoDto[];

  @ApiProperty({ required: false, type: [CreateDescriptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDescriptionDto)
  @IsOptional()
  descriptions?: CreateDescriptionDto[];

  @ApiProperty({ required: false, type: [CreateAttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeDto)
  @IsOptional()
  attributes?: CreateAttributeDto[];
}
