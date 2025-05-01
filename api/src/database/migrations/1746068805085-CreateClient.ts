import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClient1746068805085 implements MigrationInterface {
    name = 'CreateClient1746068805085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "phone_number" character varying NOT NULL, "email" character varying, "address" text, "source" character varying, "notes" text, CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99e921caf21faa2aab020476e4" ON "clients" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_1fc6c2aa167ad92bf2e086fcb2" ON "clients" ("phone_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_b48860677afe62cd96e1265948" ON "clients" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b48860677afe62cd96e1265948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1fc6c2aa167ad92bf2e086fcb2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e921caf21faa2aab020476e4"`);
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
