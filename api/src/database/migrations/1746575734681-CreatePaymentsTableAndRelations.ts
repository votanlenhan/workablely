import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentsTableAndRelations1746575734681 implements MigrationInterface {
    name = 'CreatePaymentsTableAndRelations1746575734681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b0efdc246570ede8b6de837b42"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_685fffacc6464277439d0260ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fda3a9946ae0337200bcc1aa0b"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "transaction_reference"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "transaction_reference" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "transaction_reference"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "transaction_reference" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_fda3a9946ae0337200bcc1aa0b" ON "payments" ("recorded_by_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_685fffacc6464277439d0260ab" ON "payments" ("payment_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0efdc246570ede8b6de837b42" ON "payments" ("show_id") `);
    }

}
