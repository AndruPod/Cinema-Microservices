import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovies1790088813875 implements MigrationInterface {
    name = "CreateMovies1790088813875";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "movies" (
                "id" SERIAL NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text,
                "release_year" smallint NOT NULL,
                "duration_minutes" smallint NOT NULL,
                "ticket_price" numeric(10, 2) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_movies_title_release_year" UNIQUE ("title", "release_year"),
                CONSTRAINT "CHK_movies_duration" CHECK ("duration_minutes" > 0),
                CONSTRAINT "CHK_movies_ticket_price" CHECK ("ticket_price" >= 0),
                CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "movies"
        `);
    }
}
