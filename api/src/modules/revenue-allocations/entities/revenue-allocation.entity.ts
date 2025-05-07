import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';
import { ShowRole } from '../../show-roles/entities/show-role.entity';

/**
 * Represents a single revenue allocation entry for a show,
 * detailing how much is allocated to a specific user, role, or fund.
 */
@Entity({ name: 'revenue_allocations' })
@Index(['show_id', 'user_id', 'allocated_role_name'], { unique: true, where: '"user_id" IS NOT NULL' })
@Index(['show_id', 'allocated_role_name'], { unique: true, where: '"user_id" IS NULL AND "show_role_id" IS NULL' }) // For fund-like allocations not tied to a user or specific show_role
@Index(['show_id', 'show_role_id', 'allocated_role_name'], { unique: true, where: '"show_role_id" IS NOT NULL AND "user_id" IS NULL' }) // If allocation is for a show_role itself (e.g. a general part for that role)
export class RevenueAllocation extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  show_id: string;

  @ManyToOne(() => Show, (show) => show.revenue_allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  user_id?: string;

  @ManyToOne(() => User, (user) => user.revenue_allocations, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 255, nullable: false })
  allocated_role_name: string; // e.g., "Key Photographer", "Support Photographer 1", "Marketing Fund", "Wishlist Fund"

  @Column({ type: 'uuid', nullable: true })
  @Index()
  show_role_id?: string; // Links to ShowRole if this allocation is for a defined show role (e.g. Key, Selective)

  @ManyToOne(() => ShowRole, (showRole) => showRole.revenue_allocations, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'show_role_id' })
  show_role?: ShowRole;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'text', nullable: true })
  calculation_notes?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  allocation_datetime: Date;

  // Phase 2 fields as per docs/architecture.md
  // @Column({ type: 'boolean', default: false, nullable: false })
  // is_paid_out: boolean;

  // @Column({ type: 'timestamptz', nullable: true })
  // paid_out_date?: Date;
}
