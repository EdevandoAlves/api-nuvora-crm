import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnerId1761831302367 implements MigrationInterface {
    name = 'AddOwnerId1761831302367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "ownerId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "ownerId"`);
    }

}
