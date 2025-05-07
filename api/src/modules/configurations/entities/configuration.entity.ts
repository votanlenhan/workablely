import { Entity, Column, Index, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { ConfigurationValueType } from './configuration-value-type.enum';

/**
 * Represents a system configuration entry.
 */
@Entity({ name: 'configurations' })
export class Configuration extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  key: string;

  @Column({ type: 'text', nullable: false }) // Using text to accommodate potentially long JSON strings or other values
  value: string; // Value will be stored as string, interpretation depends on value_type

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ConfigurationValueType,
    default: ConfigurationValueType.STRING,
    nullable: false,
  })
  value_type: ConfigurationValueType;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_editable: boolean;
}
