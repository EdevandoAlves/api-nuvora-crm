import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1761780311098 implements MigrationInterface {
    name = 'CreateInitialSchema1761780311098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."interaction_type_enum" AS ENUM('EMAIL', 'CALL', 'MEETING', 'NOTE', 'TASK', 'WHATSAPP')`);
        await queryRunner.query(`CREATE TABLE "interaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "customerId" uuid NOT NULL, "contactId" uuid, "userId" uuid NOT NULL, "type" "public"."interaction_type_enum" NOT NULL, "subject" character varying(255), "description" text NOT NULL, "duration" integer, "scheduledAt" TIMESTAMP, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9204371ccb2c9dab5428b406413" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "customerId" uuid NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255), "phone" character varying(20), "position" character varying(100), "isPrimary" boolean NOT NULL DEFAULT false, "linkedin" character varying(255), "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price" numeric(15,2) NOT NULL, "category" character varying(100), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deal_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dealId" uuid NOT NULL, "productId" uuid NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(15,2) NOT NULL, "discount" numeric(5,2) NOT NULL DEFAULT '0', "totalPrice" numeric(15,2) NOT NULL, CONSTRAINT "PK_a76c368ef4373c0b58996a1ff6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_type_enum" AS ENUM('CALL', 'EMAIL', 'FOLLOW_UP', 'DEMO', 'PROPOSAL', 'MEETING')`);
        await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "customerId" uuid NOT NULL, "dealId" uuid, "title" character varying(255) NOT NULL, "description" text, "type" "public"."task_type_enum" NOT NULL, "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'MEDIUM', "dueDate" date NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'PENDING', "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."deal_stage_enum" AS ENUM('QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')`);
        await queryRunner.query(`CREATE TABLE "deal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "customerId" uuid NOT NULL, "ownerId" uuid NOT NULL, "title" character varying(255) NOT NULL, "value" numeric(15,2) NOT NULL, "stage" "public"."deal_stage_enum" NOT NULL DEFAULT 'QUALIFICATION', "probability" integer NOT NULL DEFAULT '0', "expectedCloseDate" date, "lostReason" character varying(255), "closedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9ce1c24acace60f6d7dc7a7189e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."customer_status_enum" AS ENUM('LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED')`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "ownerId" uuid NOT NULL, "companyName" character varying(255) NOT NULL, "cnpj" character varying(14), "industry" character varying(100), "website" character varying(255), "employeeCount" integer, "annualRevenue" numeric(15,2), "address" jsonb, "status" "public"."customer_status_enum" NOT NULL DEFAULT 'LEAD', "source" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_d57fd5c41c612cd675b4fda4f44" UNIQUE ("organizationId", "cnpj"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_plan_enum" AS ENUM('FREE', 'BASIC', 'PRO', 'ENTERPRISE')`);
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "cnpj" character varying(14) NOT NULL, "plan" "public"."organization_plan_enum" NOT NULL DEFAULT 'FREE', "maxUsers" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "subscriptionEndsAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_480aaa8101e24b3d4e4d874e441" UNIQUE ("cnpj"), CONSTRAINT "UQ_a08804baa7c5d5427067c49a31f" UNIQUE ("slug"), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('OWNER', 'ADMIN', 'MANAGER', 'SALES', 'SUPPORT')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'SALES', "avatar" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "interaction" ADD CONSTRAINT "FK_853a393053bb95521f8a89d3e25" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interaction" ADD CONSTRAINT "FK_6680a4d595bf89fc94984065e0b" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interaction" ADD CONSTRAINT "FK_61f111fef7c98e6c82d3cde3a89" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interaction" ADD CONSTRAINT "FK_bfec87b7d90c185221bb0a4d1df" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_7719d73cd16a9f57ecc6ac24b3d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_a54f4088bd2e596cc15c1f7aa3d" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_32a4bdd261ec81f4ca6b3abe262" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal_product" ADD CONSTRAINT "FK_57a28f48ef6ca650bce402b6a55" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal_product" ADD CONSTRAINT "FK_98fb00184836d07acf6800f0167" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_5b0272d923a31c972bed1a1ac4d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_2997f01b00a9dc7d7fec2db89ae" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_62925237e1b92cf37c6079a334c" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_38fb85abdf9995efcf217f59554" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_cef8a02fad2477f5391c15d28ff" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_e67171307cc9b77c84c02cc2a1e" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_6dd837492f09ba0c61324532fee" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_a95e40a440dd90f0501baf50ca4" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_dfda472c0af7812401e592b6a61"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_a95e40a440dd90f0501baf50ca4"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_6dd837492f09ba0c61324532fee"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_e67171307cc9b77c84c02cc2a1e"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_cef8a02fad2477f5391c15d28ff"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_38fb85abdf9995efcf217f59554"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_62925237e1b92cf37c6079a334c"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_2997f01b00a9dc7d7fec2db89ae"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_5b0272d923a31c972bed1a1ac4d"`);
        await queryRunner.query(`ALTER TABLE "deal_product" DROP CONSTRAINT "FK_98fb00184836d07acf6800f0167"`);
        await queryRunner.query(`ALTER TABLE "deal_product" DROP CONSTRAINT "FK_57a28f48ef6ca650bce402b6a55"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_32a4bdd261ec81f4ca6b3abe262"`);
        await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_a54f4088bd2e596cc15c1f7aa3d"`);
        await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_7719d73cd16a9f57ecc6ac24b3d"`);
        await queryRunner.query(`ALTER TABLE "interaction" DROP CONSTRAINT "FK_bfec87b7d90c185221bb0a4d1df"`);
        await queryRunner.query(`ALTER TABLE "interaction" DROP CONSTRAINT "FK_61f111fef7c98e6c82d3cde3a89"`);
        await queryRunner.query(`ALTER TABLE "interaction" DROP CONSTRAINT "FK_6680a4d595bf89fc94984065e0b"`);
        await queryRunner.query(`ALTER TABLE "interaction" DROP CONSTRAINT "FK_853a393053bb95521f8a89d3e25"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TYPE "public"."organization_plan_enum"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TYPE "public"."customer_status_enum"`);
        await queryRunner.query(`DROP TABLE "deal"`);
        await queryRunner.query(`DROP TYPE "public"."deal_stage_enum"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
        await queryRunner.query(`DROP TABLE "deal_product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "contact"`);
        await queryRunner.query(`DROP TABLE "interaction"`);
        await queryRunner.query(`DROP TYPE "public"."interaction_type_enum"`);
    }

}
