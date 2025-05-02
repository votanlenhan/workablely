import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'equipment_assignments' })
export class EquipmentAssignment extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  equipment_id: string;

  @ManyToOne(() => Equipment, { nullable: false, onDelete: 'CASCADE' }) // Cascade if equipment deleted?
  @JoinColumn({ name: 'equipment_id' })
  @Index()
  equipment: Equipment;

  @Column({ type: 'uuid', nullable: true })
  show_id?: string;

  @ManyToOne(() => Show, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'show_id' })
  @Index()
  show?: Show;

  @Column({ type: 'uuid', nullable: true })
  assigned_to_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_user_id' })
  @Index()
  assigned_to?: User;

  @Column({ type: 'uuid', nullable: true })
  assigned_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  @Index()
  assigned_by?: User;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  assigned_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expected_return_datetime?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Index()
  actual_return_datetime?: Date;

  @Column({ type: 'text', nullable: true })
  assignment_notes?: string;

  @Column({ type: 'text', nullable: true })
  return_notes?: string;
}
