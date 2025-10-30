import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as any,
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: false, // Important: Disable for migrations
  logging: false,
  entities: [__dirname + "/entity/**/*.{js,ts}"],
  migrations: [__dirname + "/migration/**/*.{js,ts}"],
  subscribers: [],
})
