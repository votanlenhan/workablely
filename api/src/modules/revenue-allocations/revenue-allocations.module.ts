import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueAllocation } from './entities/revenue-allocation.entity';
import { RevenueAllocationsService } from './revenue-allocations.service';
import { RevenueAllocationsController } from './revenue-allocations.controller';
import { ShowsModule } from '../shows/shows.module';
import { ShowAssignmentsModule } from '../show-assignments/show-assignments.module';
import { ConfigurationsModule } from '../configurations/configurations.module';
import { Show } from '../shows/entities/show.entity';
import { ShowAssignment } from '../show-assignments/entities/show-assignment.entity';
import { ShowRole } from '../show-roles/entities/show-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RevenueAllocation,
      Show, 
      ShowAssignment,
      ShowRole
    ]),
    forwardRef(() => ShowsModule),
    ConfigurationsModule,
  ],
  controllers: [RevenueAllocationsController],
  providers: [RevenueAllocationsService],
  exports: [RevenueAllocationsService],
})
export class RevenueAllocationsModule {}
