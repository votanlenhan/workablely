import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEvaluation } from './entities/member-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEvaluation])],
})
export class MemberEvaluationsModule {} 