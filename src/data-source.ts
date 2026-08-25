import "dotenv/config";
import { join } from "node:path";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: process.env.TYPEORM_HOST,
  port: Number.parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: false,
  entities: [join(__dirname, "entity", "*.{ts,js}")],
  migrations: [join(__dirname, "migration", "*.{ts,js}")],
});
