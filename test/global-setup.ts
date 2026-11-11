import * as dotenv from "dotenv";
import { join } from "node:path";
import { Client } from "pg";
import { DataSource } from "typeorm";

const TEST_DATABASE = "nuvora_crm_test";

function connection(database: string) {
  return {
    host: process.env.TYPEORM_HOST ?? "localhost",
    port: Number.parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
    user: process.env.TYPEORM_USERNAME ?? "postgres",
    password: process.env.TYPEORM_PASSWORD,
    database,
  };
}

export default async function globalSetup() {
  dotenv.config({ path: join(__dirname, "..", ".env") });

  const admin = new Client(connection("postgres"));
  await admin.connect();
  await admin.query(
    `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DATABASE],
  );
  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE}"`);
  await admin.query(`CREATE DATABASE "${TEST_DATABASE}"`);
  await admin.end();

  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.TYPEORM_HOST ?? "localhost",
    port: Number.parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
    username: process.env.TYPEORM_USERNAME ?? "postgres",
    password: process.env.TYPEORM_PASSWORD,
    database: TEST_DATABASE,
    synchronize: false,
    entities: [join(process.cwd(), "dist", "entity", "*.js")],
    migrations: [join(process.cwd(), "dist", "migration", "*.js")],
  });

  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
