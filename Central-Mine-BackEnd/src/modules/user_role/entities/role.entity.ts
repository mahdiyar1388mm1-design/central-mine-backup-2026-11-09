import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { PermissionTag } from '../types/permission-tag.enum';

/** کلاس موجودیت نقش */
@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 50 })
  public name: string;

  @Column({
    type: 'enum',
    enum: PermissionTag,
    default: [],
    array: true,
  })
  public permissions: PermissionTag[];

  @ManyToMany(() => User, (user) => user.roles)
  public users: User[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;
}

export default Role;
