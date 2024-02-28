import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DB_URL as string);
const db = drizzle(client, { schema, logger: true });

async function seedDatabase() {
  try {
    await seedEmployees();
    await seedSupplier();
    await seedGames();
    await seedProductCategories();
    await seedGameRealms();
    await seedProducts();
    console.log('SEED ENDED')
  } catch (error) {
    console.log(error)
  } finally {
    process.exit(0)
  }
};

async function seedEmployees() {
  await db.insert(schema.employees).values({ name: "Merlyx" }).onConflictDoNothing();
}

async function seedSupplier() {
  await db.insert(schema.suppliers).values({ name: "Pingy" }).onConflictDoNothing();
}

async function seedGames() {
  await db
    .insert(schema.games)
    .values([{ name: "OSRS" }, { name: "RS3" }, { name: "World of Warcraft" }])
    .onConflictDoNothing();
}

async function seedProductCategories() {
  await db
    .insert(schema.productCategories)
    .values([{ name: "Currency" }, { name: "Items" }, { name: "Accounts" }])
    .onConflictDoNothing();
}

async function seedGameRealms() {
  await db
    .insert(schema.gameRealms)
    .values([{ gameId: 1 }, { gameId: 2 }, { gameId: 3, server: "Anathema", region: "NA", attributes: { faction: "Horde" } }])
    .onConflictDoNothing();
}

async function seedProducts() {
  await db
    .insert(schema.products)
    .values([
      { gameId: 1, productCategoryId: 1, name: "OSRS Gold", description: "Gold in OSRS" },
      { gameId: 2, productCategoryId: 1, name: "RS3 Gold", description: "Gold in RS3" },
      { gameId: 3, productCategoryId: 1, name: "WoW Gold", description: "Gold in WoW" },
    ])
    .onConflictDoNothing();
}

seedDatabase();
