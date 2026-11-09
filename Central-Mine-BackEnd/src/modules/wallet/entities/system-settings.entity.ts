import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id: number;

  // نرخ ثابت تبدیل ۱ توکن به ریال (۴,۸۴۰,۰۰۰,۰۰۰)
  @Column({ type: 'numeric', precision: 20, scale: 0, default: '4840000000' })
  lthBaseRateIrr: string;

  // درصد پاداش ۲۴ ساعته (۰.۳۴٪)
  @Column({ type: 'numeric', precision: 6, scale: 4, default: '0.0034' })
  dailyRewardRate: string;

  // نسبت سهم حجم پایه / نگتیو (پیش‌فرض ۳۰٪)
  @Column({ type: 'numeric', precision: 5, scale: 2, default: '30.00' })
  baseRewardRatio: string;

  // نسبت سهم استیک (پیش‌فرض ۷۰٪)
  @Column({ type: 'numeric', precision: 5, scale: 2, default: '70.00' })
  stakingRewardRatio: string;

  // درصد کارمزد شبکه (پیش‌فرض ۱٪)
  @Column({ type: 'numeric', precision: 5, scale: 2, default: '1.00' })
  transactionFeePercent: string;

  // دوره قفل استیک به روز (۳۲۸۵ روز - معادل ۹ سال)
  @Column({ type: 'int', default: 3285 })
  stakingLockupDays: number;

  @UpdateDateColumn()
  updatedAt: Date;
}