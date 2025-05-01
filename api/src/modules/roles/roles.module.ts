import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  // controllers: [], // Add controllers later if needed
  // providers: [],   // Add services later if needed
  // exports: [],     // Export service/repo if needed
})
export class RolesModule {} 