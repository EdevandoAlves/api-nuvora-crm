import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnTokenAndExpiresAt1761909474285 implements MigrationInterface {
  name = "AddColumnTokenAndExpiresAt1761909474285";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "token" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "expiresAt" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "expiresAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token"`);
  }
}
