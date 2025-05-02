import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEquipmentAssignment1746069491446
  implements MigrationInterface
{
  name = 'CreateEquipmentAssignment1746069491446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "equipment_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "equipment_id" uuid NOT NULL, "show_id" uuid, "assigned_to_user_id" uuid, "assigned_by_user_id" uuid, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expected_return_datetime" TIMESTAMP WITH TIME ZONE, "actual_return_datetime" TIMESTAMP WITH TIME ZONE, "assignment_notes" text, "return_notes" text, CONSTRAINT "PK_362e1dfb9d68080d3243772b463" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa0ac82c1ba1a3e9ca03eaaf3c" ON "equipment_assignments" ("equipment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae74796876e22fdca33bcf3b8d" ON "equipment_assignments" ("show_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39a90125e81cc19a67cce2fdae" ON "equipment_assignments" ("assigned_to_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9841266642305757bfefb30d79" ON "equipment_assignments" ("assigned_by_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f6f9b3867b7e6ffeebaee4a19" ON "equipment_assignments" ("actual_return_datetime") `,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_ae74796876e22fdca33bcf3b8db" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_39a90125e81cc19a67cce2fdae6" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_9841266642305757bfefb30d799" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_9841266642305757bfefb30d799"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_39a90125e81cc19a67cce2fdae6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_ae74796876e22fdca33bcf3b8db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f6f9b3867b7e6ffeebaee4a19"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9841266642305757bfefb30d79"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_39a90125e81cc19a67cce2fdae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae74796876e22fdca33bcf3b8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa0ac82c1ba1a3e9ca03eaaf3c"`,
    );
    await queryRunner.query(`DROP TABLE "equipment_assignments"`);
  }
}
