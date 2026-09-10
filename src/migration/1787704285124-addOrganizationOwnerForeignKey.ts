import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationOwnerForeignKey1787704285124 implements MigrationInterface {
  name = "AddOrganizationOwnerForeignKey1787704285124";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD CONSTRAINT "FK_organization_owner" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP CONSTRAINT "FK_organization_owner"`,
    );
  }
}
