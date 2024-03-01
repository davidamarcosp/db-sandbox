import { PgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DB_URL as string);
const db = drizzle(client, { schema, logger: true });

async function unSeedDatabase() {
  try {
    const tableEntries = Object.entries(schema);
    for (const [_key, value] of tableEntries) {
      if (!(value instanceof PgTable)) continue;
      await db.delete(value);
    }
    console.log("UNSEED ENDED");
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(0);
  }
}

unSeedDatabase();
