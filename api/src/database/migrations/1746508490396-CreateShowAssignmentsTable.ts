import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShowAssignmentsTable1746508490396 implements MigrationInterface {
    name = 'CreateShowAssignmentsTable1746508490396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_99e921caf21faa2aab020476e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1fc6c2aa167ad92bf2e086fcb2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b48860677afe62cd96e1265948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9944508fb5d6429e9466777626"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba09bd5d3e716c3e48194c385b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c314efe39958aa453a24f86844"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5dba5a8f64bd85c262187a8918"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ab2829c3f2c41016cc94f7741"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25f626abb1dd396e305c2cc5a6"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "phone_number" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_b48860677afe62cd96e12659482"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "source" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "title" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "show_type"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "show_type" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "status" character varying(50) NOT NULL DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "payment_status" character varying(50) NOT NULL DEFAULT 'Unpaid'`);
        await queryRunner.query(`ALTER TABLE "show_roles" DROP CONSTRAINT "UQ_25f626abb1dd396e305c2cc5a6c"`);
        await queryRunner.query(`ALTER TABLE "show_roles" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "show_roles" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "show_roles" ADD CONSTRAINT "UQ_25f626abb1dd396e305c2cc5a6c" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "show_assignments" DROP COLUMN "confirmation_status"`);
        await queryRunner.query(`CREATE TYPE "public"."show_assignments_confirmation_status_enum" AS ENUM('Pending', 'Confirmed', 'Declined')`);
        await queryRunner.query(`ALTER TABLE "show_assignments" ADD "confirmation_status" "public"."show_assignments_confirmation_status_enum" NOT NULL DEFAULT 'Pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "show_assignments" DROP COLUMN "confirmation_status"`);
        await queryRunner.query(`DROP TYPE "public"."show_assignments_confirmation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "show_assignments" ADD "confirmation_status" character varying NOT NULL DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "show_roles" DROP CONSTRAINT "UQ_25f626abb1dd396e305c2cc5a6c"`);
        await queryRunner.query(`ALTER TABLE "show_roles" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "show_roles" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "show_roles" ADD CONSTRAINT "UQ_25f626abb1dd396e305c2cc5a6c" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "payment_status" character varying NOT NULL DEFAULT 'Unpaid'`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "status" character varying NOT NULL DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "show_type"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "show_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "source" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_b48860677afe62cd96e12659482"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "phone_number" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_25f626abb1dd396e305c2cc5a6" ON "show_roles" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_1ab2829c3f2c41016cc94f7741" ON "shows" ("created_by_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5dba5a8f64bd85c262187a8918" ON "shows" ("payment_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_c314efe39958aa453a24f86844" ON "shows" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba09bd5d3e716c3e48194c385b" ON "shows" ("start_datetime") `);
        await queryRunner.query(`CREATE INDEX "IDX_9944508fb5d6429e9466777626" ON "shows" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b48860677afe62cd96e1265948" ON "clients" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_1fc6c2aa167ad92bf2e086fcb2" ON "clients" ("phone_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_99e921caf21faa2aab020476e4" ON "clients" ("name") `);
    }

}
