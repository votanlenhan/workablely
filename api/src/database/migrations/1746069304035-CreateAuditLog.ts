import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1746069304035 implements MigrationInterface {
  name = 'CreateAuditLog1746069304035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_name" character varying NOT NULL, "entity_id" uuid NOT NULL, "action" character varying NOT NULL, "changed_by_user_id" uuid, "change_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "old_values" jsonb, "new_values" jsonb, "details" text, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4057c4849108f6d6ccb77a4e91" ON "audit_logs" ("entity_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85c204d8e47769ac183b32bf9c" ON "audit_logs" ("entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5bed0b4342bcc0aba215c8e653" ON "audit_logs" ("change_timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b7baacadd9021b5b2904bbf20" ON "audit_logs" ("changed_by_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_5b7baacadd9021b5b2904bbf205" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_5b7baacadd9021b5b2904bbf205"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b7baacadd9021b5b2904bbf20"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5bed0b4342bcc0aba215c8e653"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85c204d8e47769ac183b32bf9c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4057c4849108f6d6ccb77a4e91"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
