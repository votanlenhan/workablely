import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { ShowAssignment } from '../../show-assignments/entities/show-assignment.entity';
import { RevenueAllocation } from '../../revenue-allocations/entities/revenue-allocation.entity';

@Entity({ name: 'show_roles' })
export class ShowRole extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0.00,
  })
  default_allocation_percentage?: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  // --- Relations --- //
  @OneToMany(() => ShowAssignment, (assignment) => assignment.show_role)
  showAssignments: ShowAssignment[];

  @OneToMany(() => RevenueAllocation, (allocation) => allocation.show_role)
  revenue_allocations: RevenueAllocation[];
}
