import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';
import { Show } from './entities/show.entity';
import { ClientsModule } from '@/modules/clients/clients.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
// import { UsersModule } from '@/modules/users/users.module'; // Import UsersModule later

@Module({
  imports: [
    TypeOrmModule.forFeature([Show]),
    forwardRef(() => ClientsModule),
    forwardRef(() => PaymentsModule),
    // forwardRef(() => UsersModule), // Add later
  ],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [ShowsService],
})
export class ShowsModule {}
