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
    console.log("SEED ENDED");
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(0);
  }
}

async function seedEmployees() {
  await db.delete(schema.employees);
  await db.insert(schema.employees).values({ id: 1, name: "Merlyx", discordId: "149378100088668160" }).onConflictDoNothing();
}

async function seedSupplier() {
  await db.delete(schema.suppliers);
  await db.insert(schema.suppliers).values({ id: 1, name: "Pingy" }).onConflictDoNothing();
}

async function seedGames() {
  await db.delete(schema.games);
  await db
    .insert(schema.games)
    .values([
      { id: 1, name: "Oldschool Runescape", shortCode: "OSRS" },
      { id: 2, name: "RuneScape 3", shortCode: "RS3" },
      { id: 3, name: "World of Warcraft", shortCode: "WoW" },
    ])
    .onConflictDoNothing();
}

async function seedProductCategories() {
  await db.delete(schema.productCategories);
  await db
    .insert(schema.productCategories)
    .values([
      { id: 1, name: "Currency" },
      { id: 2, name: "Items" },
      { id: 3, name: "Accounts" },
    ])
    .onConflictDoNothing();
}

async function seedGameRealms() {
  await db.delete(schema.gameRealms);
  await db
    .insert(schema.gameRealms)
    .values([
      { id: 1, gameId: 1, server: "Main Server" },
      { id: 2, gameId: 2, server: "Main Server" },
      { id: 3, gameId: 3, server: "Anathema", region: "NA", attributes: { faction: "Horde" } },
    ])
    .onConflictDoNothing();
}

async function seedProducts() {
  await db.delete(schema.products);
  await db
    .insert(schema.products)
    .values([
      { id: 1, gameRealmId: 1, gameId: 1, productCategoryId: 1, name: "OSRS Gold", description: "Gold in OSRS" },
      { id: 2, gameRealmId: 2, gameId: 2, productCategoryId: 1, name: "RS3 Gold", description: "Gold in RS3" },
      { id: 3, gameRealmId: 3, gameId: 3, productCategoryId: 1, name: "WoW Gold", description: "Gold in WoW" },
    ])
    .onConflictDoNothing();
}

seedDatabase();
