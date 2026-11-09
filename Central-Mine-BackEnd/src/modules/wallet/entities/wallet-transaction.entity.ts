import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',              // خرید پکیج / ورود
  WITHDRAW = 'WITHDRAW',            // برداشت ریالی / خروج
  P2P_OUT = 'P2P_OUT',              // حساب به حساب ارسالی
  P2P_IN = 'P2P_IN',                // حساب به حساب دریافتی
  STAKING_REWARD = 'STAKING_REWARD',// سود روزانه ۲۴ ساعته
  FEE_COLLECTION = 'FEE_COLLECTION',// کسر کارمزد ۱٪ به نفع خزانه
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  // مبلغ تراکنش به LTH (با دقت ۱۲ رقم اعشار)
  @Column({ type: 'numeric', precision: 36, scale: 12, default: '0' })
  amountLth: string;

  // مبلغ تراکنش به ریال
  @Column({ type: 'numeric', precision: 36, scale: 0, default: '0' })
  amountIrr: string;

  // کارمزد ۱٪ کسرشده به LTH
  @Column({ type: 'numeric', precision: 36, scale: 12, default: '0' })
  feeLth: string;

  // کارمزد ۱٪ کسرشده به ریال
  @Column({ type: 'numeric', precision: 36, scale: 0, default: '0' })
  feeIrr: string;

  // شماره کارت مقصد در انتقال P2P
  @Column({ length: 34, nullable: true })
  targetCardNumber?: string;

  // شناسه لات مربوطه در عملیات فروش
  @Column({ length: 128, nullable: true })
  referenceTokenId?: string;

  @Column({ default: 'SUCCESS' })
  status: 'SUCCESS' | 'PENDING' | 'FAILED';

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;
}