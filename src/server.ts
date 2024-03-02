import * as dotenv from "dotenv";
dotenv.config();

import { Decimal } from 'decimal.js'
import * as faker from "@faker-js/faker";
import { serve } from "@hono/node-server";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import postgres from "postgres";
import { updateStockTransaction } from ".";
import * as schema from "./schema";

const client = postgres(process.env.DB_URL as string);
const db = drizzle(client, { schema, logger: true });

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/generate/purchase", async (c) => {
  const { productId, employeeId, supplierId } = c.req.query();

  if (productId && Number.isNaN(parseInt(productId))) {
    return c.json({ message: "Invalid productId" }, 404);
  }

  if (employeeId && Number.isNaN(parseInt(employeeId))) {
    return c.json({ message: "Invalid employeeId" }, 404);
  }

  if (supplierId && Number.isNaN(parseInt(supplierId))) {
    return c.json({ message: "Invalid supplierId" }, 404);
  }

  const products = productId ? await db.query.products.findMany({ where: eq(schema.products.id, parseInt(productId)) }) : await db.query.products.findMany();

  const employees = employeeId
    ? await db.query.employees.findMany({ where: eq(schema.employees.id, parseInt(employeeId)) })
    : await db.query.employees.findMany();

  const suppliers = supplierId
    ? await db.query.suppliers.findMany({ where: eq(schema.suppliers.id, parseInt(supplierId)) })
    : await db.query.suppliers.findMany();

  const product = getRandomElement(products);
  const employee = getRandomElement(employees);
  const supplier = getRandomElement(suppliers);

  if (!product) {
    return c.json({ message: "No products found" }, 404);
  }

  if (!employee) {
    return c.json({ message: "No employees found" }, 404);
  }

  if (!supplier) {
    return c.json({ message: "No suppliers found" }, 404);
  }

  const randomPrice = new Decimal(faker.fakerEN.number.float({ max: 1500, min: 15, fractionDigits: 2 })).toString();
  const randomQuantity = new Decimal(faker.fakerEN.number.float({ max: 2000, min: 100, fractionDigits: 2 })).toString();
  const rate = (+randomPrice / +randomQuantity).toString();

  console.log({ randomPrice, randomQuantity, rate })

  const createdPurchase = await db
    .insert(schema.purchaseOrders)
    .values({
      supplierId: supplier.id,
      employeeId: employee.id,
      gameRealmId: product.gameRealmId,
      price: randomPrice,
      productId: product.id,
      quantity: randomQuantity,
      rate: rate,
      status: "CREATED",
    })
    .returning();

  await updateStockTransaction(createdPurchase[0], "PURCHASE");

  return c.json(createdPurchase, 200);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

function getRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  if (arr.length === 1) {
    return arr[0];
  }

  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
