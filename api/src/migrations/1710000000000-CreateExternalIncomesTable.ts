import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalIncomesTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE external_incomes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        income_date DATE NOT NULL,
        source VARCHAR(255),
        notes TEXT,
        recorded_by_user_id UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE external_incomes;`);
  }
} 