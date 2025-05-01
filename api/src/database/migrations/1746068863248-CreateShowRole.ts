import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShowRole1746068863248 implements MigrationInterface {
    name = 'CreateShowRole1746068863248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "show_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "default_allocation_percentage" numeric(5,2) DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_25f626abb1dd396e305c2cc5a6c" UNIQUE ("name"), CONSTRAINT "PK_edda1bea60fa151d8f129ffe1fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25f626abb1dd396e305c2cc5a6" ON "show_roles" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_25f626abb1dd396e305c2cc5a6"`);
        await queryRunner.query(`DROP TABLE "show_roles"`);
    }

}
