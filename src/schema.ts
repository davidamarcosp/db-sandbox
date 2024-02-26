import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const products = pgTable("Products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const employees = pgTable("Employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const salesOrdersStatusEnum = pgEnum("salesOrdersStatus", ["CREATED", "CANCELLED", "DELIVERED"]);

export const salesOrders = pgTable("SalesOrders", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .references(() => products.id)
    .notNull(),
  employeeId: integer("employeeId")
    .references(() => employees.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  status: salesOrdersStatusEnum("status"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const purchaseOrdersStatusEnum = pgEnum("purchaseOrdersStatus", ["CREATED", "CANCELLED", "PAID"]);

export const purchaseOrders = pgTable("PurchasesOrders", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .references(() => products.id)
    .notNull(),
  employeeId: integer("employeeId")
    .references(() => employees.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  status: purchaseOrdersStatusEnum("status"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const transactionTypeEnum = pgEnum("transactionType", ["PURCHASE", "SALE", "RETURN", "DAMAGE", "CORRECTION", "TRANSFER"]);

export const stockTransactions = pgTable("StockTransactions", {
  id: serial("id").primaryKey(),
  quantityChange: integer("quantityChange").notNull(),
  transactionType: transactionTypeEnum("transactionType"),
  productId: integer("productId")
    .references(() => products.id)
    .notNull(),
  employeeId: integer("employeeId")
    .references(() => employees.id)
    .notNull(),
  salesOrderId: integer("salesOrderId")
    .references(() => salesOrders.id)
    .notNull(),
  purchasesOrderId: integer("purchasesOrderId")
    .references(() => purchaseOrders.id)
    .notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const productStockByEmployee = pgTable("ProductStockByEmployee", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .references(() => products.id)
    .notNull(),
  employeeId: integer("employeeId")
    .references(() => employees.id)
    .notNull(),
  currentStock: integer("currentStock").default(0).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});
