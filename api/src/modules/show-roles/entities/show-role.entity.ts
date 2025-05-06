// import { ShowAssignment } from '@/modules/show-assignments/entities/show-assignment.entity'; // Temporarily commented out
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('show_roles')
export class ShowRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0.00,
  })
  default_allocation_percentage: number | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // --- Relations --- //
  // @OneToMany(() => ShowAssignment, (assignment) => assignment.showRole) // Uncomment when ShowAssignment exists
  // showAssignments: ShowAssignment[];
}
