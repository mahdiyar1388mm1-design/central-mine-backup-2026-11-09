import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

/** کلاس موجودیت بخش‌های توضیحات محصول (هر محصول می‌تواند چند بخش توضیح داشته باشد) */
@Entity('product_descriptions')
export class Description {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.descriptions, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ length: 128, nullable: true })
  title?: string;

  @Column({ length: 1024, nullable: true })
  paragraph?: string;

  @Column({ length: 128, nullable: true })
  image?: string;

  @Column({ length: 128, nullable: true })
  video?: string;
}
