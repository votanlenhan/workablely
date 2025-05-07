import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentAssignment } from './entities/equipment-assignment.entity';
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { EquipmentAssignmentsController } from './equipment-assignments.controller';
import { EquipmentModule } from '@/modules/equipment/equipment.module';
import { ShowsModule } from '@/modules/shows/shows.module';
import { UsersModule } from '@/modules/users/users.module';

// Import entities needed for repository injection
import { Equipment } from '@/modules/equipment/entities/equipment.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Show } from '@/modules/shows/entities/show.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipmentAssignment, 
      Equipment, 
      User, 
      Show
    ]),
    forwardRef(() => EquipmentModule),
    forwardRef(() => ShowsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EquipmentAssignmentsController],
  providers: [EquipmentAssignmentsService],
  exports: [EquipmentAssignmentsService],
})
export class EquipmentAssignmentsModule {}
