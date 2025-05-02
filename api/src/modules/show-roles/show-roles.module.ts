import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowRole } from './entities/show-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShowRole])],
})
export class ShowRolesModule {}
