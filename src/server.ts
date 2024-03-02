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

app.post("/generate/sale", async (c) => {
  const { productId, marketplaceId, employeeId } = c.req.query();

  if (productId && Number.isNaN(parseInt(productId))) {
    return c.json({ message: "Invalid productId" }, 404);
  }

  if (marketplaceId && Number.isNaN(parseInt(marketplaceId))) {
    return c.json({ message: "Invalid marketplaceId" }, 404);
  }

  if (employeeId && Number.isNaN(parseInt(employeeId))) {
    return c.json({ message: "Invalid employeeId" }, 404);
  }

  const products = productId ? await db.query.products.findMany({ where: eq(schema.products.id, parseInt(productId)) }) : await db.query.products.findMany();

  const marketplaces = marketplaceId
    ? await db.query.marketplaces.findMany({ where: eq(schema.marketplaces.id, parseInt(marketplaceId)) })
    : await db.query.marketplaces.findMany();

  const employees = employeeId
    ? await db.query.employees.findMany({ where: eq(schema.employees.id, parseInt(employeeId)) })
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
  const randomQuantityDelivered = new Decimal(faker.fakerEN.number.float({ max: missingQuantitytoDeliver, min: 15, fractionDigits: 2 })).toString();
  const isSaleFullyDelivered = missingQuantitytoDeliver.toString() === randomQuantityDelivered;

  await db.transaction(async (tx) => {
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
      tx.rollback();
      return c.json({ message: `No stock for product "${salesOrder.productId}"` }, 400);
    }

    await tx.insert(schema.productStockTransactions).values({
      employeeId: salesOrder.employeeId,
      productId: salesOrder.productId,
      gameRealmId: salesOrder.gameRealmId,
      stockChange: randomQuantityDelivered,
      transactionType: "SALE",
      salesOrderId: salesOrder.salesOrderId,
    });

    await tx.update(schema.salesOrders).set({
      quantityDelivered: randomQuantityDelivered,
      status: isSaleFullyDelivered ? "DELIVERED" : "CREATED",
    });
  });

  return c.json({ message: `${randomQuantityDelivered} delivered for sale "${salesOrderId}"` }, 200);
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
