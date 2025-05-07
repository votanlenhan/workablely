import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfigurationsTable1746592963076 implements MigrationInterface {
    name = 'CreateConfigurationsTable1746592963076';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type for value_type
        await queryRunner.query(`CREATE TYPE "public"."configurations_value_type_enum" AS ENUM('string', 'number', 'boolean', 'json')`);
        
        // Create the configurations table
        await queryRunner.query(
            `CREATE TABLE "configurations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "key" character varying(255) NOT NULL, 
                "value" text NOT NULL, 
                "description" text, 
                "value_type" "public"."configurations_value_type_enum" NOT NULL DEFAULT 'string', 
                "is_editable" boolean NOT NULL DEFAULT true, 
                CONSTRAINT "UQ_configurations_key" UNIQUE ("key"), 
                CONSTRAINT "PK_configurations_id" PRIMARY KEY ("id")
            )`
        );
        
        // Create an index on the key column for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_configurations_key" ON "configurations" ("key")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.query(`DROP INDEX "public"."IDX_configurations_key"`);
        
        // Drop the table
        await queryRunner.query(`DROP TABLE "configurations"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE "public"."configurations_value_type_enum"`);
    }

}
