import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowRolesService } from './show-roles.service';
import { ShowRolesController } from './show-roles.controller';
import { ShowRole } from './entities/show-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShowRole])],
  controllers: [ShowRolesController],
  providers: [ShowRolesService],
  exports: [ShowRolesService], // Export service if needed by other modules (e.g., ShowAssignments)
})
export class ShowRolesModule {}
