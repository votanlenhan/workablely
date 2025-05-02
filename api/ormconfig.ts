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
  // Explicitly list entities. Add ALL entities referenced by migrations here.
  entities: [
    'src/modules/users/entities/user.entity.ts',
    'src/modules/roles/entities/role.entity.ts',
    'src/modules/permissions/entities/permission.entity.ts',
    // TODO: Add ALL other entities used by migrations below
    // Example: 'src/modules/clients/entities/client.entity.ts',
    // Example: 'src/modules/shows/entities/show.entity.ts',
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