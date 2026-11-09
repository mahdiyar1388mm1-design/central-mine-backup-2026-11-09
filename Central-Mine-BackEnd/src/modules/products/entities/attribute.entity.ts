import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

/** کلاس موجودیت ویژگی‌های کلید-مقداری محصول (مثل جنس، برند) */
@Entity('product_attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ length: 100 })
  key: string;

  @Column({ length: 255 })
  value: string;
}
