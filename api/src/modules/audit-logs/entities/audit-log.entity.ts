import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  entity_name: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  entity_id: string;

  @Column({ nullable: false })
  @Index()
  action: string;

  @Column({ type: 'uuid', nullable: true })
  changed_by_user_id?: string;

  @CreateDateColumn({
    name: 'change_timestamp', // Explicit column name
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  @Index()
  change_timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  old_values?: object;

  @Column({ type: 'jsonb', nullable: true })
  new_values?: object;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_user_id' })
  @Index()
  changed_by?: User;
} 