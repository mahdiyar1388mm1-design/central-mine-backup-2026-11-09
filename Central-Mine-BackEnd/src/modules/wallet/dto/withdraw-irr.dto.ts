import { IsNotEmpty, IsString } from 'class-validator';

export class WithdrawIrrDto {
  @IsNotEmpty({ message: 'شماره شبا الزامی است.' })
  @IsString({ message: 'شماره شبا باید به صورت متنی ارسال شود.' })
  shebaNumber: string;

  @IsNotEmpty({ message: 'مبلغ برداشت الزامی است.' })
  amountIrr: string | number;
}
