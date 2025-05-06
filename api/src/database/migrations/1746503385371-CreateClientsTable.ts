import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientsTable1746503385371 implements MigrationInterface {
    name = 'CreateClientsTable1746503385371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_1c1e0637ecf1f6401beb9a68ab" ON "permissions" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa938076aecb265e4446874d3a" ON "permissions" ("subject") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_aa938076aecb265e4446874d3a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c1e0637ecf1f6401beb9a68ab"`);
    }

}
