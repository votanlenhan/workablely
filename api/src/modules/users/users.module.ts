import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
// Import Service and Controller later when created
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  // controllers: [UsersController],
  // providers: [UsersService],
  // exports: [UsersService], // Export service if needed by other modules (e.g., AuthModule)
})
export class UsersModule {} 