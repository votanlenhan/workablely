import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Load environment variables
ConfigModule.forRoot({
  envFilePath: '.env',
});

const configService = new ConfigService();

const options: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  // ssl: configService.get<string>('NODE_ENV') === 'production' 
  //   ? { rejectUnauthorized: false } 
  //   : false,
};

// Export DataSource instance
export const AppDataSource = new DataSource(options); 