import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'member_evaluations' })
@Unique(['show_id', 'evaluated_user_id']) // Now refers to explicit columns
@Check(`"rating" >= 1 AND "rating" <= 10`) // Check constraint for rating
export class MemberEvaluation extends BaseEntity {
  // Added export
  @Column({ type: 'uuid', nullable: false })
  show_id: string; // Explicit column for FK and constraints

  @ManyToOne(() => Show, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  @Index()
  show: Show;

  @Column({ type: 'uuid', nullable: false })
  evaluated_user_id: string; // Explicit column for FK and constraints

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluated_user_id' })
  @Index()
  evaluated_user: User;

  // ... rest of entity ...
}
