import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeResetToken1764421974731 implements MigrationInterface {
  name = "ChangeResetToken1764421974731";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetToken" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "expiresAt" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "expiresAt" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetToken"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "token" character varying NOT NULL`,
    );
  }
}
