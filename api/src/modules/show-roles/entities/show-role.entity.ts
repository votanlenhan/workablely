import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
// import { ShowAssignment } from '../../show-assignments/entities/show-assignment.entity'; // Add later

@Entity({ name: 'show_roles' })
export class ShowRole extends BaseEntity {
  @Column({ unique: true, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  default_allocation_percentage?: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  // Define O2M relationship with ShowAssignment (Commented out temporarily)
  // @OneToMany(() => ShowAssignment, (assignment) => assignment.showRole)
  // assignments: ShowAssignment[];
}
