import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'external_incomes' })
export class ExternalIncome extends BaseEntity {
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
  income_date: Date;

  @Column({ nullable: true })
  @Index()
  source?: string; // Consider Enum

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  @Index()
  recorded_by?: User;
} 