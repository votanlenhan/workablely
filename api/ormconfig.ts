import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the api directory context
dotenv.config({ path: path.resolve(__dirname, '.env') });

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Ensure ALL entities are listed here for the CLI to work correctly
  entities: [
    'src/modules/users/entities/user.entity.ts',
    'src/modules/roles/entities/role.entity.ts',
    'src/modules/permissions/entities/permission.entity.ts',
    'src/modules/clients/entities/client.entity.ts',
    'src/modules/show-roles/entities/show-role.entity.ts',
    'src/modules/shows/entities/show.entity.ts',
    'src/modules/show-assignments/entities/show-assignment.entity.ts',
    'src/modules/payments/entities/payment.entity.ts',
    'src/modules/equipment/entities/equipment.entity.ts',
    'src/modules/equipment-assignments/entities/equipment-assignment.entity.ts',
    'src/modules/expenses/entities/expense.entity.ts',
    'src/modules/external-incomes/entities/external-income.entity.ts',
    'src/modules/configurations/entities/configuration.entity.ts',
    'src/modules/revenue-allocations/entities/revenue-allocation.entity.ts',
    // TODO: Add ALL other entities used by migrations below
    // Example: 'src/modules/equipment/entities/equipment.entity.ts',
    // Example: 'src/modules/payments/entities/payment.entity.ts',
    // ... etc
  ],
  // Keep migrations path relative to api directory root
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true, // Keep logging enabled for CLI
  // ssl options might still need conditional logic based on NODE_ENV if needed for CLI
  // ssl: process.env.NODE_ENV === 'production' 
  //   ? { rejectUnauthorized: false } 
  //   : false,
};

// Export DataSource instance
export const AppDataSource = new DataSource(options); 