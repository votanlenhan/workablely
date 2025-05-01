import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Load environment variables using dotenv directly for CLI usage
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env' });

// Use ConfigService to fetch env vars (mainly for consistency, though dotenv is loaded above)
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'], // Path relative to dist folder after build
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'], // Path to migration files
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  // Naming strategy can be added here if needed
  // migrationsTableName: 'migrations', // Optional: customize migration table name
};

// Create DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 