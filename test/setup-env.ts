import { join } from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "..", ".env") });

process.env.NODE_ENV = "test";
process.env.TYPEORM_DATABASE = "nuvora_crm_test";
process.env.PORT = "0";
