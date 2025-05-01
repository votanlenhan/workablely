import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Import modules later as they are created
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ShowRolesModule } from './modules/show-roles/show-roles.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { ConfigurationsModule } from './modules/configurations/configurations.module';
import { ExternalIncomesModule } from './modules/external-incomes/external-incomes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ShowsModule } from './modules/shows/shows.module';
import { ShowAssignmentsModule } from './modules/show-assignments/show-assignments.module';
import { EquipmentAssignmentsModule } from './modules/equipment-assignments/equipment-assignments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RevenueAllocationsModule } from './modules/revenue-allocations/revenue-allocations.module';
import { MemberEvaluationsModule } from './modules/member-evaluations/member-evaluations.module';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './modules/users.service';
import { UsersController } from './modules/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify the .env file path
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Auto-detect entities
        synchronize: false, // IMPORTANT: Disable synchronize in production/staging, use migrations instead
        autoLoadEntities: true, // Recommended by NestJS TypeORM docs
        logging: configService.get('NODE_ENV') === 'development', // Log SQL in dev
      }),
    }),
    // Add feature modules here later
    UsersModule,
    RolesModule,
    PermissionsModule,
    ClientsModule,
    ShowRolesModule,
    EquipmentModule,
    ConfigurationsModule,
    ExternalIncomesModule,
    ExpensesModule,
    AuditLogsModule,
    ShowsModule,
    ShowAssignmentsModule,
    EquipmentAssignmentsModule,
    PaymentsModule,
    RevenueAllocationsModule,
    MemberEvaluationsModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService, AuthService, UsersService],
})
export class AppModule {}
