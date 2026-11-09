import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

export type AdminRecordType =
  | 'treasury'
  | 'stake-return'
  | 'base-return'
  | 'fee'
  | 'buyback'
  | 'journal'
  | 'support';

@Entity('admin_records')
export class AdminRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 32 })
  type: AdminRecordType;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  data: Record<string, unknown>;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
