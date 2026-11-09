import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sku } from './sku.entity';

/** کلاس موجودیت تصاویر یک SKU */
@Entity('product_images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => Sku, (sku) => sku.images, { onDelete: 'CASCADE' })
  sku: Sku;

  @CreateDateColumn()
  createdAt: Date;
}
