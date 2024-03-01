import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const sql = postgres(process.env.DB_URL, { max: 1 });
const db = drizzle(sql);

(async function migrator() {
  try {
    await migrate(db, { migrationsFolder: "./src/migrations" });
    console.log("MIGRATIONS APPLIED");
  } catch (error) {
    console.log(error);
  } finally {
    await sql.end();
  }
})();
