import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentAssignment } from './entities/equipment-assignment.entity';
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { EquipmentAssignmentsController } from './equipment-assignments.controller';
import { EquipmentModule } from '@/modules/equipment/equipment.module';
import { ShowsModule } from '@/modules/shows/shows.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentAssignment]),
    forwardRef(() => EquipmentModule),
    forwardRef(() => ShowsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EquipmentAssignmentsController],
  providers: [EquipmentAssignmentsService],
  exports: [EquipmentAssignmentsService],
})
export class EquipmentAssignmentsModule {}
