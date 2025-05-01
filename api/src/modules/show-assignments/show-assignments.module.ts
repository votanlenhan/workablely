import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowAssignment } from './entities/show-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShowAssignment])],
})
export class ShowAssignmentsModule {} 