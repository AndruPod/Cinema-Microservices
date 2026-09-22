import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrders1790088814854 implements MigrationInterface {
    name = "CreateOrders1790088814854";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."order_status" AS ENUM('CONFIRMED', 'CANCELLED')
        `);
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" SERIAL NOT NULL,
                "user_id" integer NOT NULL,
                "movie_id" integer NOT NULL,
                "movie_title" character varying(255) NOT NULL,
                "movie_release_year" smallint NOT NULL,
                "ticket_price" numeric(10, 2) NOT NULL,
                "quantity" smallint NOT NULL,
                "total_price" numeric(12, 2) NOT NULL,
                "status" "public"."order_status" NOT NULL DEFAULT 'CONFIRMED',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "CHK_orders_total_price" CHECK ("total_price" >= 0),
                CONSTRAINT "CHK_orders_quantity" CHECK ("quantity" > 0),
                CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_movie_id" ON "orders" ("movie_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_user_id_created_at" ON "orders" ("user_id", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_orders_user_id_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_orders_movie_id"
        `);
        await queryRunner.query(`
            DROP TABLE "orders"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."order_status"
        `);
    }
}
