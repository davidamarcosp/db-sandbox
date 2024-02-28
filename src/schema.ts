import { relations } from "drizzle-orm";
import { decimal, integer, json, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

// Missing columns:
// - Game short code

export const games = pgTable("Games", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const gameRealms = pgTable("GameRealms", {
  id: serial("id").primaryKey(),
  server: varchar("server", { length: 255 }).default("Main Server").notNull(),
  region: varchar("region", { length: 255 }),
  attributes: json("attributes").default({}),
  gameId: integer("gameId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const gameRealmsRelations = relations(gameRealms, ({ one }) => ({
  game: one(games, {
    fields: [gameRealms.gameId],
    references: [games.id],
  }),
}));

export const productCategories = pgTable("ProductCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const products = pgTable("Products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  gameId: integer("gameId").notNull(),
  productCategoryId: integer("productCategoryId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const productsRelations = relations(products, ({ one }) => ({
  game: one(games, {
    fields: [products.gameId],
    references: [games.id],
  }),
  productCategory: one(productCategories, {
    fields: [products.productCategoryId],
    references: [productCategories.id],
  }),
}));

export const employees = pgTable("Employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const suppliers = pgTable("Suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const salesOrdersStatusEnum = pgEnum("salesOrdersStatus", ["CREATED", "CANCELLED", "DELIVERED"]);

export const salesOrders = pgTable("SalesOrders", {
  id: serial("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  status: salesOrdersStatusEnum("status"),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  gameRealmId: integer("gameRealmId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const salesOrdersRelations = relations(salesOrders, ({ one }) => ({
  product: one(products, {
    fields: [salesOrders.productId],
    references: [products.id],
  }),
  employee: one(employees, {
    fields: [salesOrders.employeeId],
    references: [employees.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [salesOrders.gameRealmId],
    references: [gameRealms.id],
  }),
}));

export const purchaseOrdersStatusEnum = pgEnum("purchaseOrdersStatus", ["CREATED", "CANCELLED", "PAID"]);

export const purchaseOrders = pgTable("PurchasesOrders", {
  id: serial("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  status: purchaseOrdersStatusEnum("status"),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  supplierId: integer("supplierId"),
  gameRealmId: integer("gameRealmId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const purchasesOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  product: one(products, {
    fields: [purchaseOrders.productId],
    references: [products.id],
  }),
  employee: one(employees, {
    fields: [purchaseOrders.employeeId],
    references: [employees.id],
  }),
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [purchaseOrders.gameRealmId],
    references: [gameRealms.id],
  }),
}));

export const productStockTransactionsTypeEnum = pgEnum("transactionType", ["PURCHASE", "SALE", "RETURN", "DAMAGE", "CORRECTION", "TRANSFER"]);

export const productStockTransactions = pgTable("ProductStockTransactions", {
  id: serial("id").primaryKey(),
  quantityChange: integer("quantityChange").notNull(),
  transactionType: productStockTransactionsTypeEnum("transactionType").notNull(),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  gameRealmId: integer("gameRealmId").notNull(),
  salesOrderId: integer("salesOrderId"),
  purchasesOrderId: integer("purchasesOrderId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const productStockTransactionsRelations = relations(productStockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [productStockTransactions.productId],
    references: [products.id],
  }),
  employee: one(employees, {
    fields: [productStockTransactions.employeeId],
    references: [employees.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [productStockTransactions.gameRealmId],
    references: [gameRealms.id],
  }),
  salesOrder: one(salesOrders, {
    fields: [productStockTransactions.salesOrderId],
    references: [salesOrders.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [productStockTransactions.purchasesOrderId],
    references: [purchaseOrders.id],
  }),
}));

export const productStock = pgTable(
  "ProductStock",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    employeeId: integer("employeeId").notNull(),
    gameRealmId: integer("gameRealmId").notNull(),
    currentStock: integer("currentStock").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    employee_product_gameRealm_idx: unique("employee_product_gameRealm").on(table.employeeId, table.productId, table.gameRealmId),
  }),
);

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, {
    fields: [productStock.productId],
    references: [products.id],
  }),
  employee: one(employees, {
    fields: [productStock.employeeId],
    references: [employees.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [productStock.gameRealmId],
    references: [gameRealms.id],
  }),
}));

export const supplierBalanceTransactionsTypeEnum = pgEnum("transactionType", ["PURCHASE", "ADJUSTMENT", "PAYMENT"]);

export const supplierBalanceTransactions = pgTable("SupplierBalanceTransactions", {
  id: serial("id").primaryKey(),
  quantityChange: decimal("quantityChange", { precision: 19, scale: 4 }).notNull(),
  transactionType: supplierBalanceTransactionsTypeEnum("transactionType").notNull(),
  notes: text("notes"),
  purchasesOrderId: integer("purchasesOrderId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const supplierBalance = pgTable("SupplierBalance", {
  id: serial("id").primaryKey(),
  currentBalance: integer("currentBalance").notNull(),
  supplierId: integer("supplierId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});
