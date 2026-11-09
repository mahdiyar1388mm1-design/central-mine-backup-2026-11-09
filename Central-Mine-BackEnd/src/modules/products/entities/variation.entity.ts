import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sku } from './sku.entity';

/** کلاس موجودیت ویژگی‌های محصول (مثل رنگ، سایز) */
@Entity('product_variations')
export class Variation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Sku, (sku) => sku.variations)
  skus: Sku[];

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  value: string;
}
