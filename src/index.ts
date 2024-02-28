import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { ProductStockTransactionTypeUnion } from "./schema";

const client = postgres(process.env.DB_URL as string);
const db = drizzle(client, { schema, logger: true });

async function main() {
  await updateStockTransaction(mockedSalesOrder, "SALE");
  process.exit(0);
}

const mockedPurchaseOrder: schema.PurchaseOrder = {
  id: 1,
  employeeId: 1,
  gameRealmId: 1,
  productId: 1,
  supplierId: 1,
  quantity: 1000,
  status: "PAID",
  createdAt: new Date().toDateString(),
  updatedAt: new Date().toDateString(),
};

const mockedSalesOrder: schema.SalesOrder = {
  id: 1,
  employeeId: 1,
  gameRealmId: 1,
  productId: 1,
  quantity: -500,
  status: "DELIVERED",
  createdAt: new Date().toDateString(),
  updatedAt: new Date().toDateString(),
};

async function updateStockTransaction(order: schema.PurchaseOrder | schema.SalesOrder, type: ProductStockTransactionTypeUnion) {
  const { employeeId, productId, gameRealmId, quantity, id } = order;

  await db.transaction(async (tx) => {
    const [stock] = await tx
      .select()
      .from(schema.productStock)
      .where(
        and(eq(schema.productStock.employeeId, employeeId), eq(schema.productStock.productId, productId), eq(schema.productStock.gameRealmId, gameRealmId)),
      );

    if (stock) {
      const updatedStock = stock.currentStock + quantity;
      await tx.update(schema.productStock).set({ currentStock: updatedStock }).where(eq(schema.productStock.id, stock.id));
    } else {
      await tx.insert(schema.productStock).values({
        currentStock: quantity,
        employeeId,
        gameRealmId,
        productId,
      });
    }

    await tx.insert(schema.productStockTransactions).values({
      employeeId,
      productId,
      gameRealmId,
      quantityChange: quantity,
      transactionType: type,
      purchasesOrderId: type === "PURCHASE" ? id : null,
      salesOrderId: type === "SALE" ? id : null,
    });
  });

  // USE CASE:
  // - It should create an insert into the "ProductStock" table in the case where that given stock doesn't exists - PASS
  // - It should update an existing entry from the "ProductStock" table in the case where that given stock exists - PASS
  // - It should make an insert into the "ProductStockTransactions" table - PASS
}

main();
