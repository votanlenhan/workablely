import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'expenses' })
export class Expense extends BaseEntity {
  @Column({ nullable: false })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({ type: 'date', nullable: false })
  @Index()
  expense_date: Date;

  @Column({ nullable: false })
  @Index()
  category: string; // Consider Enum or separate table

  @Column({ type: 'boolean', default: false, nullable: false })
  @Index()
  is_wishlist_expense: boolean;

  @Column({ nullable: true })
  payment_method?: string;

  @Column({ nullable: true })
  vendor?: string;

  @Column({ nullable: true })
  receipt_url?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  @Index()
  recorded_by?: User;
} 