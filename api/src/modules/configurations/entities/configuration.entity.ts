import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// Note: No BaseEntity as PK is 'key' (string), not generated UUID

@Entity({ name: 'configurations' })
export class Configuration {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'varchar', nullable: false })
  value: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: false, default: 'string' })
  value_type: string; // 'string', 'number', 'boolean', 'percentage'

  @Column({ type: 'boolean', default: true, nullable: false })
  is_editable: boolean;

  // Manually adding created_at and updated_at as it doesn't inherit BaseEntity
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
} 