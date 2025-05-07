import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExpensesTable1746585818305 implements MigrationInterface {
    name = 'CreateExpensesTable1746585818305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fe39a24be568bdb4292aa55c5b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e069bf5f4d4aaab62a84f24ca4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5847ddbb47884a4e4156513d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6334fcfb65d2927cd1459a22c9"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "description" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "payment_method" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "vendor"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "vendor" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "receipt_url"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "receipt_url" character varying(2048)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "receipt_url"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "receipt_url" character varying`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "vendor"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "vendor" character varying`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "payment_method" character varying`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "category" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_6334fcfb65d2927cd1459a22c9" ON "expenses" ("recorded_by_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5847ddbb47884a4e4156513d7" ON "expenses" ("is_wishlist_expense") `);
        await queryRunner.query(`CREATE INDEX "IDX_e069bf5f4d4aaab62a84f24ca4" ON "expenses" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe39a24be568bdb4292aa55c5b" ON "expenses" ("expense_date") `);
    }

}
