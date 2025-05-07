import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique, TableCheck } from "typeorm";

export class CreateMemberEvaluationsTable1746608406018 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "member_evaluations",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "show_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "evaluated_user_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "evaluator_user_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "rating",
                        type: "smallint",
                        isNullable: true,
                    },
                    {
                        name: "comments",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "evaluation_date",
                        type: "timestamptz",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
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
            true, // ifNotExists true, just in case
        );

        await queryRunner.createForeignKeys("member_evaluations", [
            new TableForeignKey({
                columnNames: ["show_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "shows",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["evaluated_user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["evaluator_user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
        ]);

        await queryRunner.createUniqueConstraint(
            "member_evaluations",
            new TableUnique({ name: "UQ_member_evaluations_show_evaluated_user", columnNames: ["show_id", "evaluated_user_id"] }),
        );
        
        await queryRunner.createCheckConstraint(
            "member_evaluations",
            new TableCheck({ name: "CHK_member_evaluations_rating", expression: `\"rating\" IS NULL OR (\"rating\" >= 1 AND \"rating\" <= 10)` }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Constraints and foreign keys are dropped automatically when table is dropped if using queryRunner.dropTable
        await queryRunner.dropTable("member_evaluations");
    }

}
