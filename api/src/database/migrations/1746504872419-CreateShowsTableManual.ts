import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateShowsTableManual1746504872419 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "shows",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "client_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "show_type",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "start_datetime",
                        type: "timestamptz",
                        isNullable: false,
                    },
                    {
                        name: "end_datetime",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "location_address",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "location_details",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "requirements",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                        default: "'Pending'", // Enum default
                    },
                    {
                        name: "total_price",
                        type: "decimal",
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                        default: 0.00,
                    },
                    {
                        name: "deposit_amount",
                        type: "decimal",
                        precision: 12,
                        scale: 2,
                        isNullable: true,
                        default: 0.00,
                    },
                    {
                        name: "deposit_date",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "total_collected",
                        type: "decimal",
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                        default: 0.00,
                    },
                    {
                        name: "amount_due",
                        type: "decimal",
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                        default: 0.00,
                    },
                    {
                        name: "payment_status",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                        default: "'Unpaid'", // Enum default
                    },
                    {
                        name: "post_processing_deadline",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "delivered_at",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "completed_at",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "cancelled_at",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "cancellation_reason",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "created_by_user_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                ],
            }),
            true, // If table exists, skip
        );

        // Add foreign keys separately
        await queryRunner.createForeignKey("shows", new TableForeignKey({
            columnNames: ["client_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "clients",
            onDelete: "RESTRICT",
        }));

        await queryRunner.createForeignKey("shows", new TableForeignKey({
            columnNames: ["created_by_user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys before dropping table
        const table = await queryRunner.getTable("shows");
        if (table) { // Check if table exists
            const clientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("client_id") !== -1);
            const userForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("created_by_user_id") !== -1);
            if (clientForeignKey) await queryRunner.dropForeignKey("shows", clientForeignKey);
            if (userForeignKey) await queryRunner.dropForeignKey("shows", userForeignKey);
        }

        await queryRunner.dropTable("shows");
    }

}
