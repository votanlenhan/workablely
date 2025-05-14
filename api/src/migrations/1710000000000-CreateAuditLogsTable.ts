import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entity_name" varchar(255) NOT NULL,
        "entity_id" uuid NOT NULL,
        "action" varchar(50) NOT NULL,
        "old_values" jsonb,
        "new_values" jsonb,
        "details" text,
        "changed_by_user_id" uuid,
        "change_timestamp" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      );

      -- Create index for querying logs for a specific entity
      CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entity_name", "entity_id");
      
      -- Create index for querying logs by user
      CREATE INDEX "IDX_audit_logs_changed_by" ON "audit_logs" ("changed_by_user_id");
      
      -- Create index for querying logs by timestamp
      CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("change_timestamp");

      -- Add foreign key constraint for changed_by_user_id
      ALTER TABLE "audit_logs"
        ADD CONSTRAINT "FK_audit_logs_changed_by_user"
        FOREIGN KEY ("changed_by_user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "audit_logs";
    `);
  }
} 