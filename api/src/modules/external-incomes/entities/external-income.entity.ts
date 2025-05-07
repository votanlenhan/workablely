import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'external_incomes' })
export class ExternalIncome extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  income_date: Date; // In DTO, this will be string, then converted

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', name: 'recorded_by_user_id', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, (user) => user.recorded_external_incomes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recorded_by_user?: User;
}
