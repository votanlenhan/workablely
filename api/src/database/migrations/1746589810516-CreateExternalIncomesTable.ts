import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExternalIncomesTable1746589810516 implements MigrationInterface {
    name = 'CreateExternalIncomesTable1746589810516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_24c0a22f86698a318c54284461"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3429d3235e2b6838e20034f042"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d1f8d67ca9aebbcdd26328449"`);
        await queryRunner.query(`ALTER TABLE "external_incomes" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "external_incomes" ADD "description" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "external_incomes" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "external_incomes" ADD "source" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "external_incomes" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "external_incomes" ADD "source" character varying`);
        await queryRunner.query(`ALTER TABLE "external_incomes" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "external_incomes" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_7d1f8d67ca9aebbcdd26328449" ON "external_incomes" ("recorded_by_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3429d3235e2b6838e20034f042" ON "external_incomes" ("source") `);
        await queryRunner.query(`CREATE INDEX "IDX_24c0a22f86698a318c54284461" ON "external_incomes" ("income_date") `);
    }

}
