import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfiguration1746069162604 implements MigrationInterface {
    name = 'CreateConfiguration1746069162604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "configurations" ("key" character varying(255) NOT NULL, "value" character varying NOT NULL, "description" text, "value_type" character varying NOT NULL DEFAULT 'string', "is_editable" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3c658898252e3694655de8a07e7" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "configurations"`);
    }

}
