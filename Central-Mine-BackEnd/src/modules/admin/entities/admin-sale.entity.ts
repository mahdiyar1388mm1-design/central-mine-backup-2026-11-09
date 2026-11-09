import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_sales')
export class AdminSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ length: 255 })
  productName: string;

  @Index()
  @Column({ length: 120, default: 'بدون برند' })
  brand: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 20, scale: 0 })
  revenueIrr: string;

  @Column({ type: 'numeric', precision: 20, scale: 0, default: '0' })
  costIrr: string;

  @Index()
  @Column({ length: 24, default: 'paid' })
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';

  /** وضعیت‌های عملیاتی فروش توکن تا زمان اتصال بانکداری شرکتی */
  @Column({ type: 'boolean', default: true })
  serviceable: boolean;

  @Column({ type: 'boolean', default: false })
  sent: boolean;

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  soldAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
