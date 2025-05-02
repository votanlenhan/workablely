import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpense1746069254595 implements MigrationInterface {
  name = 'CreateExpense1746069254595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "description" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "expense_date" date NOT NULL, "category" character varying NOT NULL, "is_wishlist_expense" boolean NOT NULL DEFAULT false, "payment_method" character varying, "vendor" character varying, "receipt_url" character varying, "notes" text, "recorded_by_user_id" uuid, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe39a24be568bdb4292aa55c5b" ON "expenses" ("expense_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e069bf5f4d4aaab62a84f24ca4" ON "expenses" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5847ddbb47884a4e4156513d7" ON "expenses" ("is_wishlist_expense") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6334fcfb65d2927cd1459a22c9" ON "expenses" ("recorded_by_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_6334fcfb65d2927cd1459a22c9e" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_6334fcfb65d2927cd1459a22c9e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6334fcfb65d2927cd1459a22c9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5847ddbb47884a4e4156513d7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e069bf5f4d4aaab62a84f24ca4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe39a24be568bdb4292aa55c5b"`,
    );
    await queryRunner.query(`DROP TABLE "expenses"`);
  }
}
