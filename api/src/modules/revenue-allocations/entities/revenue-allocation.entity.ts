import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';
import { ShowRole } from '../../show-roles/entities/show-role.entity';

@Entity({ name: 'revenue_allocations' })
export class RevenueAllocation extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  show_id: string;

  @ManyToOne(() => Show, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  @Index()
  show: Show;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user?: User;

  @Column({ nullable: false })
  allocated_role_name: string;

  @Column({ type: 'uuid', nullable: true })
  show_role_id?: string;

  @ManyToOne(() => ShowRole, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'show_role_id' })
  @Index()
  show_role?: ShowRole;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({ type: 'text', nullable: true })
  calculation_notes?: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  allocation_datetime: Date;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_paid_out: boolean; // Consider for Phase 2

  @Column({ type: 'timestamp with time zone', nullable: true })
  paid_out_date?: Date; // Consider for Phase 2
} 