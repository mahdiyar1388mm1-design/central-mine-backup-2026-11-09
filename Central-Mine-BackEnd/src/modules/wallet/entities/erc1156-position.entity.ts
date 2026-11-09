import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum PositionStatus {
  ACTIVE = 'ACTIVE',
  SPLIT = 'SPLIT',
  TRANSFERRED_TO_TREASURY = 'TRANSFERRED_TO_TREASURY',
}

@Entity('erc1156_positions')
export class Erc1156Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // شناسه یکتا: erc1156povnftmotherid14.06.2026_UID
  @Index({ unique: true })
  @Column({ length: 128 })
  tokenId: string;

  // شناسه مادر جهت اتصال پوزیشن‌های خرد شده
  @Index()
  @Column({ length: 128 })
  motherId: string;

  // تاریخ روز ایجاد اجماع (مبنای محاسبه روزهای سپری‌شده)
  @Column({ type: 'date' })
  originDate: Date;

  // موجودی LTH نقدشونده / نگتیو (دقت ۱۲ رقم اعشار)
  @Column({ type: 'numeric', precision: 36, scale: 12 })
  amountLth: string;

  // سهم استیک انباشته متناظر
  @Column({ type: 'numeric', precision: 36, scale: 12, default: '0' })
  accruedStakeLth: string;

  // تاریخ آزادسازی استیک (۳۲۸۵ روز بعد)
  @Column({ type: 'timestamp' })
  unlockAt: Date;

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.ACTIVE,
  })
  status: PositionStatus;

  @ManyToOne(() => Wallet, (wallet) => wallet.positions, { onDelete: 'CASCADE' })
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}