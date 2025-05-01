import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Show])],
})
export class ShowsModule {} 