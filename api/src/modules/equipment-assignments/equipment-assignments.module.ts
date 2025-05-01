import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentAssignment } from './entities/equipment-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentAssignment])],
})
export class EquipmentAssignmentsModule {} 