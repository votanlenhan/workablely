import { Entity, Column, Index, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
// import { EquipmentAssignment } from '../../equipment-assignments/entities/equipment-assignment.entity'; // Add later

@Entity({ name: 'equipment' })
export class Equipment extends BaseEntity {
  // Added export
  // ... rest of the entity definition ...
}
