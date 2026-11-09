import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SellPositionDto {
  @IsNotEmpty({ message: 'شناسه پوزیشن الزامی است.' })
  @IsString({ message: 'شناسه پوزیشن باید متن معتبر باشد.' })
  tokenId: string;

  @IsOptional()
  sellAmountLth?: string | number;

  @IsOptional()
  amount?: string | number;
}
