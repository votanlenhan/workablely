import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayment1746069544042 implements MigrationInterface {
    name = 'CreatePayment1746069544042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "show_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "payment_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payment_method" character varying, "transaction_reference" character varying, "notes" text, "is_deposit" boolean NOT NULL DEFAULT false, "recorded_by_user_id" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b0efdc246570ede8b6de837b42" ON "payments" ("show_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_685fffacc6464277439d0260ab" ON "payments" ("payment_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_fda3a9946ae0337200bcc1aa0b" ON "payments" ("recorded_by_user_id") `);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b0efdc246570ede8b6de837b427" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_fda3a9946ae0337200bcc1aa0be" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_fda3a9946ae0337200bcc1aa0be"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b0efdc246570ede8b6de837b427"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fda3a9946ae0337200bcc1aa0b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_685fffacc6464277439d0260ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0efdc246570ede8b6de837b42"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
