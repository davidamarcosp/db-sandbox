import { relations } from "drizzle-orm";
import { decimal, integer, json, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const games = pgTable("Games", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortCode: varchar("shortCode", { length: 255 }).unique("game_short_code_idx").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const gamesRelations = relations(games, ({ many }) => ({
  gameRealms: many(gameRealms),
  products: many(products),
}));

export const gameRealms = pgTable(
  "GameRealms",
  {
    id: serial("id").primaryKey(),
    server: varchar("server", { length: 255 }).default("Main Server").notNull(),
    region: varchar("region", { length: 255 }),
    attributes: json("attributes").default({}),
    gameId: integer("gameId").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    gameRealms_unique_idx: unique("gameRealms_game_server").on(table.gameId, table.server),
  }),
);

export const gameRealmsRelations = relations(gameRealms, ({ one, many }) => ({
  game: one(games, {
    fields: [gameRealms.gameId],
    references: [games.id],
  }),
  price: one(productPrices, {
    fields: [gameRealms.id],
    references: [productPrices.gameRealmId],
  }),
  products: many(products),
  productStock: many(productStock),
  productStockTransactions: many(productStockTransactions),
  salesOrders: many(salesOrders),
  purchaseOrders: many(purchaseOrders),
}));

export const productCategories = pgTable("ProductCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique("productCategory").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productPricesUnitEnum = pgEnum("productPricesUnit", ["UNIT", "THOUSAND", "MILLION"]);
export type ProductPricesUnitUnion = typeof productPrices.$inferSelect.unit;

export const productPrices = pgTable("ProductPrices", {
  id: serial("id").primaryKey(),
  price: decimal("price", { precision: 19, scale: 4 }).notNull(),
  unit: productPricesUnitEnum("unit").notNull(),
  productId: integer("productId").notNull(),
  gameRealmId: integer("productId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const pricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, {
    fields: [productPrices.productId],
    references: [products.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [productPrices.gameRealmId],
    references: [gameRealms.id],
  }),
}));

export const products = pgTable(
  "Products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    gameId: integer("gameId").notNull(),
    gameRealmId: integer("gameRealmId").notNull(),
    priceId: integer("priceId").notNull(),
    productCategoryId: integer("productCategoryId").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    products_unique_idx: unique("products_game_gameRealm_productCategory").on(table.gameId, table.gameRealmId, table.productCategoryId),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  game: one(games, {
    fields: [products.gameId],
    references: [games.id],
  }),
  gameRealm: one(gameRealms, {
    fields: [products.gameRealmId],
    references: [gameRealms.id],
  }),
  productCategory: one(productCategories, {
    fields: [products.productCategoryId],
    references: [productCategories.id],
  }),
  price: one(productPrices, {
    fields: [products.priceId],
    references: [productPrices.id],
  }),
  productStock: many(productStock),
  productStockTransactions: many(productStockTransactions),
  purchaseOrders: many(purchaseOrders),
  salesOrders: many(salesOrders),
}));

export const employees = pgTable("Employees", {
  id: serial("id").primaryKey(),
  discordId: varchar("discordId", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const employeesRelations = relations(employees, ({ many }) => ({
  salesOrders: many(salesOrders),
  purchaseOrders: many(purchaseOrders),
  productStockTransactions: many(productStockTransactions),
  productStock: many(productStock),
}));

export const suppliers = pgTable("Suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  supplierBalance: one(supplierBalance, {
    fields: [suppliers.id],
    references: [supplierBalance.supplierId],
  }),
  purchaseOrders: many(purchaseOrders),
  productStockTransactions: many(productStockTransactions),
  productStock: many(productStock),
}));

export const salesOrdersStatusEnum = pgEnum("salesOrdersStatus", ["CREATED", "CANCELLED", "DELIVERED"]);
export type SalesOrdersStatusUnion = typeof salesOrders.$inferSelect.status;

export const salesOrders = pgTable("SalesOrders", {
  salesOrderId: serial("salesOrderId").primaryKey(),
  quantity: decimal("quantity", { precision: 19, scale: 4 }).notNull(),
  quantityDelivered: decimal("quantityDelivered", { precision: 19, scale: 4 }).default("0").notNull(),
  price: decimal("price", { precision: 19, scale: 4 }).notNull(),
  rate: decimal("rate", { precision: 19, scale: 4 }).notNull(),
  status: salesOrdersStatusEnum("status"),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  gameRealmId: integer("gameRealmId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export type SalesOrder = typeof salesOrders.$inferSelect;

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
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
  productStockTransactions: many(productStockTransactions),
}));

export const purchaseOrdersStatusEnum = pgEnum("purchaseOrdersStatus", ["CREATED", "CANCELLED", "PAID"]);
export type purchaseOrdersStatusUnion = typeof purchaseOrders.$inferSelect.status;

export const purchaseOrders = pgTable("PurchasesOrders", {
  purchaseOrderId: serial("purchaseOrderId").primaryKey(),
  quantity: decimal("quantity", { precision: 19, scale: 4 }).notNull(),
  price: decimal("price", { precision: 19, scale: 4 }).notNull(),
  rate: decimal("rate", { precision: 19, scale: 4 }).notNull(),
  status: purchaseOrdersStatusEnum("status"),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  supplierId: integer("supplierId"),
  gameRealmId: integer("gameRealmId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const purchasesOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
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
  productStockTransactions: many(productStockTransactions),
}));

export const productStockTransactionsTypeEnum = pgEnum("productStockTransactionType", ["PURCHASE", "SALE", "RETURN", "DAMAGE", "CORRECTION", "TRANSFER"]);
export type ProductStockTransactionTypeUnion = typeof productStockTransactions.$inferSelect.transactionType;

export const productStockTransactions = pgTable("ProductStockTransactions", {
  id: serial("id").primaryKey(),
  stockChange: decimal("stockChange", { precision: 19, scale: 4 }).notNull(),
  transactionType: productStockTransactionsTypeEnum("transactionType").notNull(),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  gameRealmId: integer("gameRealmId").notNull(),
  salesOrderId: integer("salesOrderId"),
  purchaseOrderId: integer("purchaseOrderId"),
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
    references: [salesOrders.salesOrderId],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [productStockTransactions.purchaseOrderId],
    references: [purchaseOrders.purchaseOrderId],
  }),
}));

export const productStock = pgTable(
  "ProductStock",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    employeeId: integer("employeeId").notNull(),
    gameRealmId: integer("gameRealmId").notNull(),
    currentStock: decimal("currentStock", { precision: 19, scale: 4 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    productStock_unique_idx: unique("productStock_employee_product_gameRealm").on(table.employeeId, table.productId, table.gameRealmId),
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

export const supplierBalanceTransactionsTypeEnum = pgEnum("supplierBalanceTransactionType", ["PURCHASE", "ADJUSTMENT", "PAYMENT"]);
export type supplierBalanceTransactionsTypeUnion = typeof supplierBalanceTransactions.$inferSelect.transactionType;

export const supplierBalanceTransactions = pgTable("SupplierBalanceTransactions", {
  id: serial("id").primaryKey(),
  balanceChange: decimal("quantityChange", { precision: 19, scale: 4 }).notNull(),
  transactionType: supplierBalanceTransactionsTypeEnum("transactionType").notNull(),
  notes: text("notes"),
  purchasesOrderId: integer("purchasesOrderId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const supplierBalance = pgTable("SupplierBalance", {
  id: serial("id").primaryKey(),
  currentBalance: decimal("currentBalance", { precision: 19, scale: 4 }).notNull(),
  supplierId: integer("supplierId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});
