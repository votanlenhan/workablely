import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'expenses' })
export class Expense extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column({ type: 'date' })
  expense_date: Date;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'boolean', default: false })
  is_wishlist_expense: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_method?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor?: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  receipt_url?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recorded_by_user?: User;
}
