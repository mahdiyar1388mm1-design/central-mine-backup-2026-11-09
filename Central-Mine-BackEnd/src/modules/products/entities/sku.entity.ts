import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Max, Min } from 'class-validator';
import { DecimalTransformer } from 'src/commons/types/decimal.transformer';
import { Product } from './product.entity';
import { Variation } from './variation.entity';
import { Image } from './image.entity';

/** کلاس موجودیت واحد نگهداری موجودی (SKU) یک محصول؛ هر محصول می‌تواند چند SKU
 * (مثلاً برای ترکیب‌های مختلف رنگ/سایز) داشته باشد. */
@Entity('product_skus')
export class Sku {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.skus, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToMany(() => Variation, (variation) => variation.skus, {
    cascade: true,
  })
  @JoinTable()
  variations: Variation[];

  @Column({ length: 50, nullable: true })
  upc?: string;

  /** کد داخلی SKU */
  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  /** قیمت فروش */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price: number;

  /** قیمت خرید */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  purchasePrice: number;

  /** قیمت پایه (قبل از تخفیف) */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  basicPrice?: number;

  @Column({ type: 'int', default: 0 })
  @Min(0)
  stock: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  @Min(0)
  @Max(100)
  amountCommission?: number;

  @OneToMany(() => Image, (image) => image.sku, { cascade: true })
  images: Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
