import { IsDateString, IsIn, IsInt, IsNumberString, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAdminSaleDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumberString()
  revenueIrr: string;

  @IsOptional()
  @IsNumberString()
  costIrr?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'shipped', 'cancelled'])
  status?: 'pending' | 'paid' | 'shipped' | 'cancelled';

  @IsOptional()
  @IsDateString()
  soldAt?: string;

  @IsOptional()
  serviceable?: boolean;

  @IsOptional()
  sent?: boolean;

  @IsOptional()
  paid?: boolean;
}

export class UpdateAdminSaleDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumberString()
  revenueIrr?: string;

  @IsOptional()
  @IsNumberString()
  costIrr?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'shipped', 'cancelled'])
  status?: 'pending' | 'paid' | 'shipped' | 'cancelled';

  @IsOptional()
  serviceable?: boolean;

  @IsOptional()
  sent?: boolean;

  @IsOptional()
  paid?: boolean;
}
