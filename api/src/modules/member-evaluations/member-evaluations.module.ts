import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEvaluationsService } from './member-evaluations.service';
import { MemberEvaluationsController } from './member-evaluations.controller';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { AuthModule } from '../../auth.module';
import { UsersModule } from '../users/users.module';
import { ShowsModule } from '../shows/shows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEvaluation]),
    AuthModule, // For JwtAuthGuard and user context
    forwardRef(() => UsersModule), // For injecting UsersService if needed for validation
    forwardRef(() => ShowsModule),   // For injecting ShowsService if needed for validation
  ],
  controllers: [MemberEvaluationsController],
  providers: [MemberEvaluationsService],
  exports: [MemberEvaluationsService],
})
export class MemberEvaluationsModule {}
