import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';
import { ShowRole } from '../../show-roles/entities/show-role.entity';

@Entity({ name: 'show_assignments' })
@Unique(['show_id', 'user_id']) // One user assigned only once per show (regardless of role? Decide based on logic)
export class ShowAssignment extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  show_id: string;

  @ManyToOne(() => Show, { nullable: false, onDelete: 'CASCADE' }) // Cascade delete if Show is deleted
  @JoinColumn({ name: 'show_id' })
  @Index()
  show: Show;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }) // Cascade delete if User is deleted?
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ type: 'uuid', nullable: false })
  show_role_id: string;

  @ManyToOne(() => ShowRole, { nullable: false, onDelete: 'RESTRICT' }) // Restrict deletion if assigned
  @JoinColumn({ name: 'show_role_id' })
  @Index()
  show_role: ShowRole;

  @Column({ nullable: false, default: 'Pending' })
  confirmation_status: string; // Consider Enum

  @Column({ type: 'text', nullable: true })
  decline_reason?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  assigned_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmed_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  assigned_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  @Index()
  assigned_by?: User;
}
