import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { UsersModule } from './modules/users/users.module';
// Import other modules as they are created
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ShowRolesModule } from './modules/show-roles/show-roles.module';
import { ShowsModule } from './modules/shows/shows.module';
// ... other future modules

// Explicitly import entities
import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/roles/entities/role.entity';
import { Permission } from './modules/permissions/entities/permission.entity';
import { Client } from './modules/clients/entities/client.entity';
import { ShowRole } from './modules/show-roles/entities/show-role.entity';
import { Show } from './modules/shows/entities/show.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        console.log(
          '[AppModule] TypeOrmModule.forRootAsync useFactory executing...',
        );
        const dbOptions: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [
            User,
            Role,
            Permission,
            Client,
            ShowRole,
            Show,
          ],
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
        console.log(
          '[AppModule] TypeORM Options Calculated:',
          JSON.stringify(dbOptions, (key, value) =>
            key === 'entities' ? value.map((e) => e.name) : value,
          ),
        );
        return dbOptions;
      },
    }),
    // Feature Modules
    AuthModule,
    // Import Roles & Permissions before Users
    RolesModule,
    PermissionsModule,
    UsersModule,
    ClientsModule,
    ShowRolesModule,
    ShowsModule,
    // EquipmentModule, // Add later
    // ConfigurationsModule, // Add later
    // ExternalIncomesModule, // Add later
    // ExpensesModule, // Add later
    // AuditLogsModule, // Add later
    // ShowsModule, // Add later
    // ShowAssignmentsModule, // Add later
    // EquipmentAssignmentsModule, // Add later
    // PaymentsModule, // Add later
    // RevenueAllocationsModule, // Add later
    // MemberEvaluationsModule, // Add later
  ],
  controllers: [AppController], // Only AppController belongs here
  providers: [AppService], // Only AppService belongs here
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log(`[AppModule] AppModule has been initialized.`);
  }
}
