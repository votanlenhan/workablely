import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]), // Provide both repos needed by RolesService
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Export only service
})
export class RolesModule {}
