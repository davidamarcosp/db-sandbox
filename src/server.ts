import * as dotenv from "dotenv";
dotenv.config();

import * as faker from "@faker-js/faker";
import { serve } from "@hono/node-server";
import { Decimal } from "decimal.js";
import { and, eq } from "drizzle-orm";
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
  const { employeeId, productId, supplierId } = c.req.query();

  const queryParams = { employeeId, productId, supplierId };

  const { employeeId: parsedEmployeeId, productId: parsedProductId, supplierId: parsedSupplierId } = validateQueryParams(queryParams);

  const employees = parsedEmployeeId
    ? await db.query.employees.findMany({ where: eq(schema.employees.id, parsedEmployeeId) })
    : await db.query.employees.findMany();

  const products = parsedProductId ? await db.query.products.findMany({ where: eq(schema.products.id, parsedProductId) }) : await db.query.products.findMany();

  const suppliers = parsedSupplierId
    ? await db.query.suppliers.findMany({ where: eq(schema.suppliers.id, parsedSupplierId) })
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

  const [createdPurchase] = await db
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

  await updateStockTransaction(createdPurchase, "PURCHASE");

  return c.json(createdPurchase, 200);
});

app.post("/generate/sale", async (c) => {
  const { productId, marketplaceId, employeeId } = c.req.query();

  const queryParams = { productId, marketplaceId, employeeId };

  const { productId: parsedProductId, marketplaceId: parsedMarketplaceId, employeeId: parsedEmployeeId } = validateQueryParams(queryParams);

  const products = parsedProductId ? await db.query.products.findMany({ where: eq(schema.products.id, parsedProductId) }) : await db.query.products.findMany();

  const marketplaces = parsedMarketplaceId
    ? await db.query.marketplaces.findMany({ where: eq(schema.marketplaces.id, parsedMarketplaceId) })
    : await db.query.marketplaces.findMany();

  const employees = parsedEmployeeId
    ? await db.query.employees.findMany({ where: eq(schema.employees.id, parsedEmployeeId) })
    : await db.query.employees.findMany();

  const product = getRandomElement(products);
  const marketplace = getRandomElement(marketplaces);
  const employee = getRandomElement(employees);

  if (!product) {
    return c.json({ message: "No products found" }, 404);
  }

  if (!marketplace) {
    return c.json({ message: "No marketplaces found" }, 404);
  }

  if (!employee) {
    return c.json({ message: "No employees found" }, 404);
  }

  const randomPrice = new Decimal(faker.fakerEN.number.float({ max: 1500, min: 15, fractionDigits: 2 })).toString();
  const randomQuantity = new Decimal(faker.fakerEN.number.float({ max: 2000, min: 100, fractionDigits: 2 })).toString();
  const rate = (+randomPrice / +randomQuantity).toString();

  const createdSale = await db
    .insert(schema.salesOrders)
    .values({
      employeeId: employee.id,
      gameRealmId: product.gameRealmId,
      marketplaceId: marketplace.id,
      productId: product.id,
      status: "CREATED",
      price: randomPrice,
      quantity: randomQuantity,
      rate: rate,
    })
    .returning();

  return c.json(createdSale, 200);
});

app.post("/generate/delivery", async (c) => {
  const { salesOrderId } = c.req.query();

  if (salesOrderId && Number.isNaN(parseInt(salesOrderId))) {
    return c.json({ message: "Invalid salesOrderId" }, 404);
  }

  const salesOrders = salesOrderId
    ? await db.query.salesOrders.findMany({ where: eq(schema.salesOrders.salesOrderId, parseInt(salesOrderId)) })
    : await db.query.salesOrders.findMany();

  const salesOrder = getRandomElement(salesOrders);

  if (!salesOrder) {
    return c.json({ message: "No salesOrder found" }, 404);
  }

  const missingQuantitytoDeliver = new Decimal(salesOrder.quantity).minus(new Decimal(salesOrder.quantityDelivered)).toNumber();
  const randomQuantityDelivered = new Decimal(faker.fakerEN.number.float({ max: missingQuantitytoDeliver, min: 0, fractionDigits: 2 })).toString();
  const isSaleFullyDelivered = missingQuantitytoDeliver.toString() === randomQuantityDelivered;

  const wasTransactionDone = await db.transaction(async (tx) => {
    const [stock] = await tx
      .select()
      .from(schema.productStock)
      .where(
        and(
          eq(schema.productStock.employeeId, salesOrder.employeeId),
          eq(schema.productStock.productId, salesOrder.productId),
          eq(schema.productStock.gameRealmId, salesOrder.gameRealmId),
        ),
      );

    if (stock) {
      const updatedStock = new Decimal(stock.currentStock).minus(new Decimal(randomQuantityDelivered)).toString();
      await tx.update(schema.productStock).set({ currentStock: updatedStock, updatedAt: new Date().toISOString() }).where(eq(schema.productStock.id, stock.id));
    } else {
      return false;
    }

    await tx.insert(schema.productStockTransactions).values({
      employeeId: salesOrder.employeeId,
      productId: salesOrder.productId,
      gameRealmId: salesOrder.gameRealmId,
      stockChange: randomQuantityDelivered,
      transactionType: "SALE",
      salesOrderId: salesOrder.salesOrderId,
    });

    const newQuantityDelivered = new Decimal(salesOrder.quantityDelivered).add(new Decimal(randomQuantityDelivered)).toString();

    await tx.update(schema.salesOrders).set({
      quantityDelivered: newQuantityDelivered,
      status: isSaleFullyDelivered ? "DELIVERED" : "CREATED",
      updatedAt: new Date().toISOString(),
    });

    return true;
  });

  if (wasTransactionDone) {
    return c.json({ message: `${randomQuantityDelivered} delivered for sale "${salesOrder.salesOrderId}"` }, 200);
  }

  return c.json({ message: "Delivery could not be made" }, 400);
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

function validateQueryParams<T extends Record<string, string | undefined>>(obj: T): { [K in keyof T]?: number } {
  const parsedObject = {} as { [K in keyof T]?: number };

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const str = obj[key];

      if (str === undefined) {
        continue;
      }

      const num = parseInt(str);

      if (Number.isNaN(num)) {
        throw new Error(`Value "${str}" for key "${key}" is not a valid parseable integer.`);
      }

      parsedObject[key] = num;
    }
  }

  return parsedObject;
}
