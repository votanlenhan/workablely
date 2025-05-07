import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { EquipmentAssignment } from '@/modules/equipment-assignments/entities/equipment-assignment.entity';

export enum EquipmentStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  UNDER_MAINTENANCE = 'Under Maintenance',
  RETIRED = 'Retired',
}

@Entity({ name: 'equipments' })
export class Equipment extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  serial_number?: string;

  @Column({ type: 'date', nullable: true })
  purchase_date?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchase_price?: number;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.AVAILABLE,
  })
  status: EquipmentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(
    () => EquipmentAssignment,
    (assignment) => assignment.equipment,
    { cascade: ['soft-remove'], orphanedRowAction: 'soft-delete' } // Or 'delete' if hard delete is preferred
  )
  assignments: EquipmentAssignment[];
}
