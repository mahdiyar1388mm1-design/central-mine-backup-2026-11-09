import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Max, Min } from 'class-validator';
import { Sku } from './sku.entity';
import { Video } from './video.entity';
import { Description } from './description.entity';
import { Attribute } from './attribute.entity';

/**
 * کلاس موجودیت محصول فروشگاه
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  /** برند برای تفکیک فروش و سود در پنل مدیریت */
  @Column({ length: 120, default: 'بدون برند' })
  brand: string;

  /** شناسه‌ی فروشگاه صاحب این محصول؛ تا زمانی که ماژول Shop پیاده‌سازی شود
   * به‌صورت یک شناسه‌ی ساده (بدون رابطه‌ی FK) نگه‌داری می‌شود. */
  @Column({ length: 50, nullable: true })
  shopID?: string;

  /** شناسه‌ی کاربر مالک/فروشنده‌ی محصول */
  @Column({ length: 36, nullable: true })
  ownerID?: string;

  /** شناسه‌ی دسته‌بندی؛ تا پیاده‌سازی ماژول Category به همین شکل نگه‌داری می‌شود. */
  @Column({ length: 36, nullable: true })
  categoryId?: string;

  @Column({ length: 1024, nullable: true })
  sellerDescription?: string;

  @Column({ type: 'smallint', nullable: true })
  length?: number;

  @Column({ type: 'smallint', nullable: true })
  width?: number;

  @Column({ type: 'smallint', nullable: true })
  height?: number;

  @Column({ default: true })
  visible: boolean;

  @Column({ type: 'float', default: 0 })
  @Min(0)
  @Max(5)
  rating: number;

  @Column({ type: 'integer', default: 0 })
  seen: number;

  /** حذف نرم؛ محصولات حذف‌شده در جست‌وجو و دریافت نمایش داده نمی‌شوند */
  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => Sku, (sku) => sku.product, { cascade: true })
  skus: Sku[];

  @OneToMany(() => Video, (video) => video.product, { cascade: true })
  videos: Video[];

  @OneToMany(() => Description, (description) => description.product, {
    cascade: true,
  })
  descriptions: Description[];

  @OneToMany(() => Attribute, (attribute) => attribute.product, {
    cascade: true,
  })
  attributes: Attribute[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
