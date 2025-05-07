import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Show } from '@/modules/shows/entities/show.entity';
import { User } from '@/modules/users/entities/user.entity';
import { BaseEntity } from '../../../core/database/base.entity';

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  show_id: string;

  @ManyToOne(() => Show, (show) => show.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_method?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_reference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  is_deposit: boolean;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  recorded_by_user_id?: string;

  @ManyToOne(() => User, (user) => user.recorded_payments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recorded_by_user?: User;
}
