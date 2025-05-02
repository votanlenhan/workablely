import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRevenueAllocation1746069597559
  implements MigrationInterface
{
  name = 'CreateRevenueAllocation1746069597559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "revenue_allocations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "show_id" uuid NOT NULL, "user_id" uuid, "allocated_role_name" character varying NOT NULL, "show_role_id" uuid, "amount" numeric(12,2) NOT NULL, "calculation_notes" text, "allocation_datetime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_paid_out" boolean NOT NULL DEFAULT false, "paid_out_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_675ad181228472eab7f110db76b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c2e09eeada11399f38fbd789cb" ON "revenue_allocations" ("show_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd7f4a62782c6560484ad4222a" ON "revenue_allocations" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a5f16c3837671addd8443dfab" ON "revenue_allocations" ("show_role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_989f1618bedba26f97368451c2" ON "revenue_allocations" ("allocation_datetime") `,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" ADD CONSTRAINT "FK_c2e09eeada11399f38fbd789cb6" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" ADD CONSTRAINT "FK_dd7f4a62782c6560484ad4222a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" ADD CONSTRAINT "FK_8a5f16c3837671addd8443dfabc" FOREIGN KEY ("show_role_id") REFERENCES "show_roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" DROP CONSTRAINT "FK_8a5f16c3837671addd8443dfabc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" DROP CONSTRAINT "FK_dd7f4a62782c6560484ad4222a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revenue_allocations" DROP CONSTRAINT "FK_c2e09eeada11399f38fbd789cb6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_989f1618bedba26f97368451c2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a5f16c3837671addd8443dfab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd7f4a62782c6560484ad4222a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c2e09eeada11399f38fbd789cb"`,
    );
    await queryRunner.query(`DROP TABLE "revenue_allocations"`);
  }
}
