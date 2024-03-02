import * as dotenv from "dotenv";
dotenv.config();

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { ProductStockTransactionTypeUnion } from "./schema";
import { Decimal } from 'decimal.js'

const client = postgres(process.env.DB_URL as string);
const db = drizzle(client, { schema, logger: true });

// async function main() {
//   await updateStockTransaction(mockedSalesOrder, "SALE");
//   process.exit(0);
// }

// const mockedPurchaseOrder: schema.PurchaseOrder = {
//   purchaseOrderId: 1,
//   employeeId: 1,
//   gameRealmId: 1,
//   productId: 1,
//   supplierId: 1,
//   quantity: "100",
//   price: "15",
//   rate: "0.15",
//   status: "PAID",
//   createdAt: new Date().toDateString(),
//   updatedAt: new Date().toDateString(),
// };

// const mockedSalesOrder: schema.SalesOrder = {
//   salesOrderId: 1,
//   employeeId: 1,
//   gameRealmId: 1,
//   productId: 1,
//   quantity: "-200",
//   quantityDelivered: "0",
//   price: "30",
//   rate: "0.15",
//   status: "DELIVERED",
//   createdAt: new Date().toDateString(),
//   updatedAt: new Date().toDateString(),
// };

export async function updateStockTransaction(order: schema.PurchaseOrder | schema.SalesOrder, type: ProductStockTransactionTypeUnion) {
  const { employeeId, productId, gameRealmId, quantity } = order;

  await db.transaction(async (tx) => {
    const [stock] = await tx
      .select()
      .from(schema.productStock)
      .where(
        and(eq(schema.productStock.employeeId, employeeId), eq(schema.productStock.productId, productId), eq(schema.productStock.gameRealmId, gameRealmId)),
      );

    if (stock) {
      const updatedStock = new Decimal(stock.currentStock).add(new Decimal(quantity)).toString();
      await tx.update(schema.productStock).set({ currentStock: updatedStock, updatedAt: new Date().toISOString() }).where(eq(schema.productStock.id, stock.id));
    } else {
      await tx.insert(schema.productStock).values({
        currentStock: quantity.toLocaleString(),
        employeeId,
        gameRealmId,
        productId,
      });
    }

    await tx.insert(schema.productStockTransactions).values({
      employeeId,
      productId,
      gameRealmId,
      stockChange: quantity.toLocaleString(),
      transactionType: type,
      purchaseOrderId: "purchaseOrderId" in order ? order.purchaseOrderId : null,
      salesOrderId: "salesOrderId" in order ? order.salesOrderId : null,
    });

    const isTransactionAPurchaseFromSupplier = "purchaseOrderId" in order && "supplierId" in order;

    if (type === "PURCHASE" && isTransactionAPurchaseFromSupplier && order.supplierId) {
      const [balance] = await tx.select().from(schema.supplierBalance).where(eq(schema.supplierBalance.supplierId, order.supplierId));

      if (balance) {
        const updatedBalance = new Decimal(balance.currentBalance).add(new Decimal(order.price)).toString();
        await tx.update(schema.supplierBalance).set({ currentBalance: updatedBalance, updatedAt: new Date().toISOString() }).where(eq(schema.supplierBalance.id, balance.id));
      } else {
        await tx.insert(schema.supplierBalance).values({
          currentBalance: order.price,
          supplierId: order.supplierId,
        });
      }

      await tx.insert(schema.supplierBalanceTransactions).values({
        balanceChange: order.price,
        transactionType: "PURCHASE",
        purchasesOrderId: order.purchaseOrderId,
      });
    }
  });

  // USE CASE:
  // - It should create an insert into the "ProductStock" table in the case where that given stock doesn't exists - PASS
  // - It should update an existing entry from the "ProductStock" table in the case where that given stock exists - PASS
  // - It should make an insert into the "ProductStockTransactions" table - PASS
}

// main();
