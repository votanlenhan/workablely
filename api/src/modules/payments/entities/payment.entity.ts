import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Show } from '@/modules/shows/entities/show.entity';
import { User } from '@/modules/users/entities/user.entity';
import { BaseEntity } from '../../../core/database/base.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  show_id: string;

  @ManyToOne(() => Show, (show) => show.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_method: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_reference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: false })
  is_deposit: boolean;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id: string | null;

  @ManyToOne(() => User, (user) => user.recordedPayments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recordedBy: User | null;
}
