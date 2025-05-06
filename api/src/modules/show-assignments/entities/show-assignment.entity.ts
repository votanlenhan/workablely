import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Show } from 'src/modules/shows/entities/show.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ShowRole } from 'src/modules/show-roles/entities/show-role.entity';

export enum ShowAssignmentConfirmationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  DECLINED = 'Declined',
}

@Entity({ name: 'show_assignments' })
@Unique(['show_id', 'user_id']) // One user assigned only once per show
@Index(['show_id', 'user_id'], { unique: true })
export class ShowAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  show_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  user_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  show_role_id: string;

  @Column({
    type: 'enum',
    enum: ShowAssignmentConfirmationStatus,
    nullable: false,
    default: ShowAssignmentConfirmationStatus.PENDING,
  })
  confirmation_status: ShowAssignmentConfirmationStatus;

  @Column({ type: 'text', nullable: true })
  decline_reason?: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  assigned_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmed_at?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assigned_by_user_id?: string | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedByUserId: string | null;

  // --- Relations --- //

  @ManyToOne(() => Show, (show: Show) => show.assignments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @ManyToOne(() => User, (user: User) => user.assignments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ShowRole, (showRole: ShowRole) => showRole.showAssignments, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'show_role_id' })
  showRole: ShowRole;

  @ManyToOne(() => User, (user: User) => user.assignedShowAssignments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedBy: User | null;
}
