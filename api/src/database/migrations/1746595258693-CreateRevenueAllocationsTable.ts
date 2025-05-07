import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateRevenueAllocationsTable1746595258693 implements MigrationInterface {
    name = 'CreateRevenueAllocationsTable1746595258693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the table if it already exists to avoid conflicts with constraints/indexes
        await queryRunner.query(`DROP TABLE IF EXISTS "revenue_allocations" CASCADE`);

        // --- Create revenue_allocations table ---
        await queryRunner.createTable(new Table({
            name: "revenue_allocations",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "created_at", type: "timestamptz", default: "now()" },
                { name: "updated_at", type: "timestamptz", default: "now()" },
                { name: "show_id", type: "uuid", isNullable: false },
                { name: "user_id", type: "uuid", isNullable: true },
                { name: "allocated_role_name", type: "varchar", length: "255", isNullable: false },
                { name: "show_role_id", type: "uuid", isNullable: true },
                { name: "amount", type: "decimal", precision: 12, scale: 2, isNullable: false },
                { name: "calculation_notes", type: "text", isNullable: true },
                { name: "allocation_datetime", type: "timestamptz", default: "now()", isNullable: false },
            ],
        }), true);

        // --- Add Indexes for revenue_allocations ---
        await queryRunner.createIndex("revenue_allocations", new TableIndex({
            name: "IDX_revenue_allocations_show_id",
            columnNames: ["show_id"],
        }));
        await queryRunner.createIndex("revenue_allocations", new TableIndex({
            name: "IDX_revenue_allocations_user_id",
            columnNames: ["user_id"],
        }));
        await queryRunner.createIndex("revenue_allocations", new TableIndex({
            name: "IDX_revenue_allocations_show_role_id",
            columnNames: ["show_role_id"],
        }));
        
        // Unique constraints as per entity definition
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_revenue_allocations_show_user_role_name" ON "revenue_allocations" ("show_id", "user_id", "allocated_role_name") WHERE "user_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_revenue_allocations_show_fund_role_name" ON "revenue_allocations" ("show_id", "allocated_role_name") WHERE "user_id" IS NULL AND "show_role_id" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_revenue_allocations_show_show_role_fund_name" ON "revenue_allocations" ("show_id", "show_role_id", "allocated_role_name") WHERE "show_role_id" IS NOT NULL AND "user_id" IS NULL`);

        // --- Add Foreign Keys for revenue_allocations ---
        await queryRunner.createForeignKey("revenue_allocations", new TableForeignKey({
            columnNames: ["show_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "shows",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("revenue_allocations", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL",
        }));
        await queryRunner.createForeignKey("revenue_allocations", new TableForeignKey({
            columnNames: ["show_role_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "show_roles",
            onDelete: "SET NULL",
        }));

        // --- Other ALTER and DROP commands from original migration are intentionally omitted ---
        // --- They should be reviewed and applied in a separate, dedicated migration if still needed ---
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const table = await queryRunner.getTable("revenue_allocations");
        if (table) {
            const foreignKeyShow = table.foreignKeys.find(fk => fk.columnNames.indexOf("show_id") !== -1);
            if (foreignKeyShow) await queryRunner.dropForeignKey("revenue_allocations", foreignKeyShow);

            const foreignKeyUser = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
            if (foreignKeyUser) await queryRunner.dropForeignKey("revenue_allocations", foreignKeyUser);
            
            const foreignKeyShowRole = table.foreignKeys.find(fk => fk.columnNames.indexOf("show_role_id") !== -1);
            if (foreignKeyShowRole) await queryRunner.dropForeignKey("revenue_allocations", foreignKeyShowRole);
        }
        
        // Drop unique indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_show_user_role_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_show_fund_role_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_show_show_role_fund_name"`);

        // Drop other indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_show_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_revenue_allocations_show_role_id"`);

        // Drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS "revenue_allocations"`);
        
        // --- Other commands from original down migration are intentionally omitted ---
    }
}
