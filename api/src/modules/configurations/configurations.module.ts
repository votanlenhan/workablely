import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  // exports: [], // Export service if needed globally
})
export class ConfigurationsModule {}
