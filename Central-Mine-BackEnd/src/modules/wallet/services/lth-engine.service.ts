import { Injectable, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';

export type NumericInput = Decimal | string | number;

// ایجاد موتور محاسباتی ایزوله ۳۶ رقمی با قطع اعشار به سمت پایین
const MathEngine = Decimal.clone({ precision: 36, rounding: Decimal.ROUND_DOWN });

@Injectable()
export class LthEngineService {
  private readonly DEFAULT_BASE_RATE_IRR = new MathEngine('4840000000');
  private readonly DEFAULT_DAILY_YIELD_RATE = new MathEngine('0.0034');
  private readonly DEFAULT_FEE_PERCENT = new MathEngine('0.01');

  irrToLth(irrAmount: NumericInput, baseRate: NumericInput = this.DEFAULT_BASE_RATE_IRR) {
    const irr = new MathEngine(irrAmount);
    const rate = new MathEngine(baseRate);

    if (rate.lessThanOrEqualTo(0)) {
      throw new BadRequestException('نرخ تبدیل نامعتبر است.');
    }

    const lth = irr.dividedBy(rate);
    return {
      raw: lth,
      dbValue: lth.toFixed(12),
      displayValue: lth.toFixed(8),
    };
  }

  lthToIrr(lthAmount: NumericInput, baseRate: NumericInput = this.DEFAULT_BASE_RATE_IRR) {
    const lth = new MathEngine(lthAmount);
    const rate = new MathEngine(baseRate);
    const irr = lth.times(rate);

    return {
      raw: irr,
      irrValue: irr.toFixed(0),
      tomanValue: irr.dividedBy(10).toFixed(0),
    };
  }

  calculateTransactionFee(amount: NumericInput, feeRate: NumericInput = this.DEFAULT_FEE_PERCENT) {
    const total = new MathEngine(amount);
    const rate = new MathEngine(feeRate);

    if (total.isNegative()) {
      throw new BadRequestException('مبلغ تراکنش نمی‌تواند منفی باشد.');
    }

    const fee = total.times(rate);
    const net = total.minus(fee);

    return {
      total: total.toFixed(12),
      fee: fee.toFixed(12),
      net: net.toFixed(12),
    };
  }

  calculateDailyYield(
    totalActiveLth: NumericInput,
    negativeRatio: NumericInput = 30,
    _stakeRatio: NumericInput = 70,
    yieldRate: NumericInput = this.DEFAULT_DAILY_YIELD_RATE,
    baseRate: NumericInput = this.DEFAULT_BASE_RATE_IRR,
  ) {
    const active = new MathEngine(totalActiveLth);
    const yRate = new MathEngine(yieldRate);
    const bRate = new MathEngine(baseRate);

    if (active.lessThanOrEqualTo(0)) {
      return {
        totalRewardLth: '0.000000000000',
        negativeRewardLth: '0.000000000000',
        stakedRewardLth: '0.000000000000',
        totalRewardIrr: '0',
      };
    }

    const totalDailyReward = active.times(yRate);
    const negPercent = new MathEngine(negativeRatio).dividedBy(100);

    // محاسبه نگتیو و جذب تفاوت اعشار در استیک جهت تراز قطعی کل خروجی
    const negativeReward = totalDailyReward.times(negPercent);
    const stakedReward = totalDailyReward.minus(negativeReward);

    return {
      totalRewardLth: totalDailyReward.toFixed(12),
      negativeRewardLth: negativeReward.toFixed(12),
      stakedRewardLth: stakedReward.toFixed(12),
      totalRewardIrr: totalDailyReward.times(bRate).toFixed(0),
    };
  }

  calculatePositionLiquidation(
    currentLotNegative: NumericInput,
    currentLotStaked: NumericInput,
    sellAmount: NumericInput,
    baseRate: NumericInput = this.DEFAULT_BASE_RATE_IRR,
    feePercent: NumericInput = this.DEFAULT_FEE_PERCENT,
  ) {
    const negative = new MathEngine(currentLotNegative);
    const staked = new MathEngine(currentLotStaked);
    const sell = new MathEngine(sellAmount);
    const bRate = new MathEngine(baseRate);
    const fRate = new MathEngine(feePercent);

    if (sell.lessThanOrEqualTo(0)) {
      throw new BadRequestException('حجم فروش باید بزرگ‌تر از صفر باشد.');
    }

    if (negative.lessThanOrEqualTo(0) || sell.greaterThan(negative)) {
      throw new BadRequestException('موجودی نقدشونده این پوزیشن برای این حجم فروش کافی نیست.');
    }

    let stakeToDeduct: Decimal;
    let remainingNegative: Decimal;
    let remainingStaked: Decimal;

    // در تسویه ۱۰۰٪، کل استیک متناظر کسر و مقدار باقیمانده دقیقاً صفر می‌شود
    if (sell.equals(negative)) {
      stakeToDeduct = staked;
      remainingNegative = new MathEngine(0);
      remainingStaked = new MathEngine(0);
    } else {
      const fraction = sell.dividedBy(negative);
      stakeToDeduct = staked.times(fraction);
      remainingNegative = negative.minus(sell);
      remainingStaked = staked.minus(stakeToDeduct);
    }

    const grossIrr = sell.times(bRate);
    const feeIrr = grossIrr.times(fRate);
    const netIrr = grossIrr.minus(feeIrr);

    return {
      soldLth: sell.toFixed(12),
      remainingNegativeLth: remainingNegative.toFixed(12),
      deductedStakeLth: stakeToDeduct.toFixed(12),
      remainingStakedLth: remainingStaked.toFixed(12),
      grossIrr: grossIrr.toFixed(0),
      feeIrr: feeIrr.toFixed(0),
      netIrrToUser: netIrr.toFixed(0),
    };
  }
}
