import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Erc1156Position } from './erc1156-position.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  // شماره کارت ۱۶ رقمی مجازی
  @Index({ unique: true })
  @Column({ length: 16 })
  cardNumber: string;

  // موجودی حجم پایه (خرید اولیه + ۳۰٪ پاداش‌ها)
  @Column({ type: 'numeric', precision: 36, scale: 12, default: '0' })
  baseLth: string;

  // موجودی استیک قفل‌شده (۷۰٪ پاداش‌ها)
  @Column({ type: 'numeric', precision: 36, scale: 12, default: '0' })
  stakedLth: string;

  // موجودی آزاد قابل برداشت ریالی
  @Column({ type: 'numeric', precision: 36, scale: 0, default: '0' })
  withdrawableIrr: string;

  // موجودی توکن داخلی مارکت‌پلیس (TMN)
  @Column({ type: 'numeric', precision: 36, scale: 4, default: '0' })
  balanceTmn: string;

  // مشخص‌کننده کیف پول خزانه مدیریت
  @Column({ type: 'boolean', default: false })
  isSystemTreasury: boolean;

  @OneToMany(() => Erc1156Position, (pos) => pos.wallet)
  positions: Erc1156Position[];

  @OneToMany(() => WalletTransaction, (tx) => tx.wallet)
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}