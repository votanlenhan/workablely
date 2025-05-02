import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalIncome1746069208469 implements MigrationInterface {
  name = 'CreateExternalIncome1746069208469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "external_incomes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "description" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "income_date" date NOT NULL, "source" character varying, "notes" text, "recorded_by_user_id" uuid, CONSTRAINT "PK_bfd21bffb4481d44f417082838d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_24c0a22f86698a318c54284461" ON "external_incomes" ("income_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3429d3235e2b6838e20034f042" ON "external_incomes" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d1f8d67ca9aebbcdd26328449" ON "external_incomes" ("recorded_by_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "external_incomes" ADD CONSTRAINT "FK_7d1f8d67ca9aebbcdd263284490" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_incomes" DROP CONSTRAINT "FK_7d1f8d67ca9aebbcdd263284490"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d1f8d67ca9aebbcdd26328449"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3429d3235e2b6838e20034f042"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24c0a22f86698a318c54284461"`,
    );
    await queryRunner.query(`DROP TABLE "external_incomes"`);
  }
}
