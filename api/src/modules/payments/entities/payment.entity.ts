import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  show_id: string;

  @ManyToOne(() => Show, { nullable: false, onDelete: 'CASCADE' }) // Cascade if show deleted
  @JoinColumn({ name: 'show_id' })
  @Index()
  show: Show;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  payment_date: Date;

  @Column({ nullable: true })
  payment_method?: string; // Consider Enum

  @Column({ nullable: true })
  transaction_reference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_deposit: boolean;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  @Index()
  recorded_by?: User;
}
