import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEquipmentAndAssignmentsTables1746578368565 implements MigrationInterface {
    name = 'CreateEquipmentAndAssignmentsTables1746578368565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_39a90125e81cc19a67cce2fdae6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa0ac82c1ba1a3e9ca03eaaf3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae74796876e22fdca33bcf3b8d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39a90125e81cc19a67cce2fdae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9841266642305757bfefb30d79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f6f9b3867b7e6ffeebaee4a19"`);
        await queryRunner.query(`CREATE TYPE "public"."equipments_status_enum" AS ENUM('Available', 'In Use', 'Under Maintenance', 'Retired')`);
        await queryRunner.query(`CREATE TABLE "equipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "serial_number" character varying(100), "purchase_date" date, "purchase_price" numeric(10,2), "status" "public"."equipments_status_enum" NOT NULL DEFAULT 'Available', "category" character varying(100), "notes" text, CONSTRAINT "UQ_f84861788a50fe73108a248ec37" UNIQUE ("serial_number"), CONSTRAINT "PK_250348d5d9ae4946bcd634f3e61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "assigned_to_user_id"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "assigned_at"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "expected_return_datetime"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "actual_return_datetime"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "assignment_notes"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "return_notes"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "assignment_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "expected_return_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "actual_return_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."equipment_assignments_status_enum" AS ENUM('Assigned', 'Returned', 'Overdue', 'Lost', 'Damaged')`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "status" "public"."equipment_assignments_status_enum" NOT NULL DEFAULT 'Assigned'`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_9841266642305757bfefb30d799"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ALTER COLUMN "assigned_by_user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_d82ecdca30bed38874fe5c9436d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_9841266642305757bfefb30d799" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_9841266642305757bfefb30d799"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_d82ecdca30bed38874fe5c9436d"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ALTER COLUMN "assigned_by_user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_9841266642305757bfefb30d799" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."equipment_assignments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "actual_return_date"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "expected_return_date"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "assignment_date"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "return_notes" text`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "assignment_notes" text`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "actual_return_datetime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "expected_return_datetime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD "assigned_to_user_id" uuid`);
        await queryRunner.query(`DROP TABLE "equipments"`);
        await queryRunner.query(`DROP TYPE "public"."equipments_status_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_2f6f9b3867b7e6ffeebaee4a19" ON "equipment_assignments" ("actual_return_datetime") `);
        await queryRunner.query(`CREATE INDEX "IDX_9841266642305757bfefb30d79" ON "equipment_assignments" ("assigned_by_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_39a90125e81cc19a67cce2fdae" ON "equipment_assignments" ("assigned_to_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae74796876e22fdca33bcf3b8d" ON "equipment_assignments" ("show_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fa0ac82c1ba1a3e9ca03eaaf3c" ON "equipment_assignments" ("equipment_id") `);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_39a90125e81cc19a67cce2fdae6" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment_assignments" ADD CONSTRAINT "FK_fa0ac82c1ba1a3e9ca03eaaf3cf" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
