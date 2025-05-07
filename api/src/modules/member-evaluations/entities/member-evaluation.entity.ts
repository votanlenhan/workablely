import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Unique,
} from 'typeorm';
import { Show } from '../../shows/entities/show.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('member_evaluations')
@Unique(['show_id', 'evaluated_user_id'])
@Check(`"rating" >= 1 AND "rating" <= 10`) // Check constraint for rating
export class MemberEvaluation {
  @ApiProperty({ description: 'Primary key, UUID format' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the show being evaluated' })
  @Column({ type: 'uuid' })
  show_id: string;

  @ApiProperty({ description: 'ID of the user being evaluated' })
  @Column({ type: 'uuid' })
  evaluated_user_id: string;

  @ApiProperty({ description: 'ID of the user performing the evaluation' })
  @Column({ type: 'uuid' })
  evaluator_user_id: string;

  @ApiProperty({ description: 'Rating given (e.g., 1-10)', nullable: true, type: 'integer' })
  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @ApiProperty({ description: 'Detailed comments for the evaluation', nullable: true })
  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @ApiProperty({ description: 'Date of the evaluation' })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  evaluation_date: Date;

  @ApiProperty({ description: 'Timestamp of creation' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Timestamp of last update' })
  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Show, (show) => show.member_evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @ManyToOne(() => User, (user) => user.evaluationsReceived, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluated_user_id' })
  evaluatedUser: User;

  @ManyToOne(() => User, (user) => user.evaluationsGiven, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluator_user_id' })
  evaluatorUser: User;
}
