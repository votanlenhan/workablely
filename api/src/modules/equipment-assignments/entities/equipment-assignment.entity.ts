import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Equipment } from '@/modules/equipment/entities/equipment.entity';
import { Show } from '@/modules/shows/entities/show.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum AssignmentStatus {
  ASSIGNED = 'Assigned',
  RETURNED = 'Returned',
  OVERDUE = 'Overdue',
  LOST = 'Lost',
  DAMAGED = 'Damaged',
}

@Entity({ name: 'equipment_assignments' })
export class EquipmentAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  equipment_id: string;

  @ManyToOne(() => Equipment, (equipment) => equipment.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({ type: 'uuid', nullable: true })
  show_id?: string;

  @ManyToOne(() => Show, { nullable: true, onDelete: 'SET NULL' }) // An assignment might not be for a show
  @JoinColumn({ name: 'show_id' })
  show?: Show;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string; // User to whom the equipment is assigned, could be for a show or personal use

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) // User who is assigned the equipment
  @JoinColumn({ name: 'user_id' })
  assigned_to_user?: User;

  @Column({ type: 'uuid' })
  assigned_by_user_id: string; // User who created the assignment

  @ManyToOne(() => User, { onDelete: 'SET NULL' }) // User who performed the assignment action
  @JoinColumn({ name: 'assigned_by_user_id' })
  assigned_by_user: User;

  @Column({ type: 'timestamp with time zone' })
  assignment_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expected_return_date?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  actual_return_date?: Date;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ASSIGNED,
  })
  status: AssignmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
