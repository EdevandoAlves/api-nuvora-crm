import { join } from "node:path";
import * as dotenv from "dotenv";
import { Client } from "pg";

const TEST_DATABASE = "nuvora_crm_test";

export default async function globalTeardown() {
  dotenv.config({ path: join(__dirname, "..", ".env") });

  const client = new Client({
    host: process.env.TYPEORM_HOST ?? "localhost",
    port: Number.parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
    user: process.env.TYPEORM_USERNAME ?? "postgres",
    password: process.env.TYPEORM_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();
    await client.query(
      `SELECT pg_terminate_backend(pid)
         FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [TEST_DATABASE],
    );
    await client.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE}"`);
  } finally {
    await client.end();
  }
}
