import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminStates1791800000000 implements MigrationInterface {
  name = 'CreateAdminStates1791800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_states" (
        "id" varchar(32) NOT NULL,
        "state" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_states_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_records" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(), "type" varchar(32) NOT NULL,
        "data" jsonb NOT NULL DEFAULT '{}'::jsonb, "createdBy" uuid NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_records_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_admin_records_type" ON "admin_records" ("type")`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_sales" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(), "productId" uuid NOT NULL,
        "productName" varchar(255) NOT NULL, "brand" varchar(120) NOT NULL DEFAULT 'بدون برند',
        "quantity" integer NOT NULL, "revenueIrr" numeric(20,0) NOT NULL,
        "costIrr" numeric(20,0) NOT NULL DEFAULT 0, "status" varchar(24) NOT NULL DEFAULT 'paid',
        "serviceable" boolean NOT NULL DEFAULT true, "sent" boolean NOT NULL DEFAULT false,
        "paid" boolean NOT NULL DEFAULT false,
        "soldAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_sales_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`ALTER TABLE "admin_sales" ADD COLUMN IF NOT EXISTS "serviceable" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "admin_sales" ADD COLUMN IF NOT EXISTS "sent" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "admin_sales" ADD COLUMN IF NOT EXISTS "paid" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" varchar(120) NOT NULL DEFAULT 'بدون برند'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "admin_sales"');
    await queryRunner.query('DROP TABLE IF EXISTS "admin_records"');
    await queryRunner.query('ALTER TABLE "products" DROP COLUMN IF EXISTS "brand"');
    await queryRunner.query('DROP TABLE IF EXISTS "admin_states"');
  }
}
