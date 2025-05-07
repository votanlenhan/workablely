import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalIncome } from './entities/external-income.entity';
import { ExternalIncomesService } from './external-incomes.service';
import { ExternalIncomesController } from './external-incomes.controller';
import { User } from '../users/entities/user.entity'; // User entity is related
// We don't need to import UsersModule if UserRepository is globally available or provided by TypeOrmModule.forFeature here for the service.

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalIncome, User]), // Provide repositories for ExternalIncome and User
  ],
  controllers: [ExternalIncomesController],
  providers: [ExternalIncomesService],
  exports: [ExternalIncomesService], // Export if other modules need to use ExternalIncomesService
})
export class ExternalIncomesModule {}
