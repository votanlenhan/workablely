import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShow1746069389375 implements MigrationInterface {
    name = 'CreateShow1746069389375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "client_id" uuid NOT NULL, "title" character varying, "show_type" character varying NOT NULL, "start_datetime" TIMESTAMP WITH TIME ZONE NOT NULL, "end_datetime" TIMESTAMP WITH TIME ZONE, "location_address" text, "location_details" text, "requirements" text, "status" character varying NOT NULL DEFAULT 'Pending', "total_price" numeric(12,2) NOT NULL DEFAULT '0', "deposit_amount" numeric(12,2) DEFAULT '0', "deposit_date" date, "total_collected" numeric(12,2) NOT NULL DEFAULT '0', "amount_due" numeric(12,2) NOT NULL DEFAULT '0', "payment_status" character varying NOT NULL DEFAULT 'Unpaid', "post_processing_deadline" date, "delivered_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "cancellation_reason" text, "created_by_user_id" uuid, CONSTRAINT "PK_db2b12161dbc5081c4f50025669" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9944508fb5d6429e9466777626" ON "shows" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba09bd5d3e716c3e48194c385b" ON "shows" ("start_datetime") `);
        await queryRunner.query(`CREATE INDEX "IDX_c314efe39958aa453a24f86844" ON "shows" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_5dba5a8f64bd85c262187a8918" ON "shows" ("payment_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_1ab2829c3f2c41016cc94f7741" ON "shows" ("created_by_user_id") `);
        await queryRunner.query(`ALTER TABLE "shows" ADD CONSTRAINT "FK_9944508fb5d6429e94667776269" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shows" ADD CONSTRAINT "FK_1ab2829c3f2c41016cc94f77411" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shows" DROP CONSTRAINT "FK_1ab2829c3f2c41016cc94f77411"`);
        await queryRunner.query(`ALTER TABLE "shows" DROP CONSTRAINT "FK_9944508fb5d6429e94667776269"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ab2829c3f2c41016cc94f7741"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5dba5a8f64bd85c262187a8918"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c314efe39958aa453a24f86844"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba09bd5d3e716c3e48194c385b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9944508fb5d6429e9466777626"`);
        await queryRunner.query(`DROP TABLE "shows"`);
    }

}
