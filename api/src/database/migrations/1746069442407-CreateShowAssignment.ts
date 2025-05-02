import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowAssignment1746069442407 implements MigrationInterface {
  name = 'CreateShowAssignment1746069442407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "show_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "show_id" uuid NOT NULL, "user_id" uuid NOT NULL, "show_role_id" uuid NOT NULL, "confirmation_status" character varying NOT NULL DEFAULT 'Pending', "decline_reason" text, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "confirmed_at" TIMESTAMP WITH TIME ZONE, "assigned_by_user_id" uuid, CONSTRAINT "UQ_ab0cfd553e4b1525601f3dcfcb9" UNIQUE ("show_id", "user_id"), CONSTRAINT "PK_a0c02a57439e63e07ce07ce3e59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ca7458c5d8c0983b74c12e87c" ON "show_assignments" ("show_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ca5f72efd672ca637e95cf4c9" ON "show_assignments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d53e566bc60466a4a24f4de575" ON "show_assignments" ("show_role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec9aadfea805833165cbf02782" ON "show_assignments" ("assigned_by_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" ADD CONSTRAINT "FK_3ca7458c5d8c0983b74c12e87c4" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" ADD CONSTRAINT "FK_1ca5f72efd672ca637e95cf4c94" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" ADD CONSTRAINT "FK_d53e566bc60466a4a24f4de5757" FOREIGN KEY ("show_role_id") REFERENCES "show_roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" ADD CONSTRAINT "FK_ec9aadfea805833165cbf02782d" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "show_assignments" DROP CONSTRAINT "FK_ec9aadfea805833165cbf02782d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" DROP CONSTRAINT "FK_d53e566bc60466a4a24f4de5757"`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" DROP CONSTRAINT "FK_1ca5f72efd672ca637e95cf4c94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "show_assignments" DROP CONSTRAINT "FK_3ca7458c5d8c0983b74c12e87c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec9aadfea805833165cbf02782"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d53e566bc60466a4a24f4de575"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ca5f72efd672ca637e95cf4c9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ca7458c5d8c0983b74c12e87c"`,
    );
    await queryRunner.query(`DROP TABLE "show_assignments"`);
  }
}
