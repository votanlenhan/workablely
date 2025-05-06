import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowAssignmentsService } from './show-assignments.service';
import { ShowAssignmentsController } from './show-assignments.controller';
import { ShowAssignment } from './entities/show-assignment.entity';
import { UsersModule } from '../users/users.module';
import { ShowsModule } from '../shows/shows.module';
import { ShowRolesModule } from '../show-roles/show-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShowAssignment]),
    forwardRef(() => UsersModule),
    forwardRef(() => ShowsModule),
    forwardRef(() => ShowRolesModule),
  ],
  controllers: [ShowAssignmentsController],
  providers: [ShowAssignmentsService],
  exports: [ShowAssignmentsService],
})
export class ShowAssignmentsModule {}
