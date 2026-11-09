import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Persistent state for the operations dashboard.
 *
 * The admin UI is intentionally stateful (treasury, sales, journal and support
 * are edited together). Keeping one versioned JSON document gives the UI an
 * atomic save boundary while the public wallet/payment data remains in its
 * existing normalized tables.
 */
@Entity('admin_states')
export class AdminState {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  state: Record<string, unknown>;

  @UpdateDateColumn()
  updatedAt: Date;
}
