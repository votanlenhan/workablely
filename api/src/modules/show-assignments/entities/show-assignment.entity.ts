import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';
import { ShowRole } from '../../show-roles/entities/show-role.entity';

export enum ConfirmationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  DECLINED = 'Declined',
}

@Entity({ name: 'show_assignments' })
@Index(['show_id', 'user_id'], { unique: true })
@Check(`"confirmation_status" IN ('Pending', 'Confirmed', 'Declined')`)
export class ShowAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  show_id: string;

  @ManyToOne(() => Show, (show) => show.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @ManyToOne(() => User, (user) => user.show_assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  show_role_id: string;

  @ManyToOne(() => ShowRole, (role) => role.showAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_role_id' })
  show_role: ShowRole;

  @Column({
    type: 'enum',
    enum: ConfirmationStatus,
    default: ConfirmationStatus.PENDING,
  })
  confirmation_status: ConfirmationStatus;

  @Column({ type: 'text', nullable: true })
  decline_reason?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assigned_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  confirmed_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assigned_by_user_id?: string;

  @ManyToOne(() => User, (user) => user.assigned_show_assignments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assigned_by_user?: User;
}
