import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalIncome } from './entities/external-income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalIncome])],
})
export class ExternalIncomesModule {}
