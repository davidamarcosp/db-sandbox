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
  products: many(products),
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

export const marketplaces = pgTable("Marketplaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique("marketplaceName").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const marketplacesRelations = relations(marketplaces, ({ many }) => ({
  salesOrders: many(salesOrders),
}));

export const productPricesUnitEnum = pgEnum("productPricesUnit", ["UNIT", "THOUSAND", "MILLION"]);
export type ProductPricesUnitUnion = typeof products.$inferSelect.unit;

export const products = pgTable(
  "Products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    price: decimal("price", { precision: 19, scale: 4 }).notNull(),
    unit: productPricesUnitEnum("unit").notNull(),
    description: text("description"),
    gameRealmId: integer("gameRealmId").notNull(),
    productCategoryId: integer("productCategoryId").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    products_unique_idx: unique("products_gameRealm_productCategory").on(table.gameRealmId, table.productCategoryId),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  gameRealm: one(gameRealms, {
    fields: [products.gameRealmId],
    references: [gameRealms.id],
  }),
  productCategory: one(productCategories, {
    fields: [products.productCategoryId],
    references: [productCategories.id],
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
}));

export const salesOrdersStatusEnum = pgEnum("salesOrdersStatus", ["CREATED", "CANCELLED", "DELIVERED"]);
export type SalesOrdersStatusUnion = typeof salesOrders.$inferSelect.status;

export const salesOrders = pgTable("SalesOrders", {
  salesOrderId: serial("salesOrderId").primaryKey(),
  quantity: decimal("quantity", { precision: 19, scale: 4 }).notNull(),
  quantityDelivered: decimal("quantityDelivered", { precision: 19, scale: 4 }).default("0").notNull(),
  price: decimal("price", { precision: 19, scale: 4 }).notNull(),
  rate: decimal("rate", { precision: 19, scale: 4 }).notNull(),
  status: salesOrdersStatusEnum("status").notNull(),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  marketplaceId: integer("marketplaceId").notNull(),
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
  marketplace: one(marketplaces, {
    fields: [salesOrders.marketplaceId],
    references: [marketplaces.id],
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
  status: purchaseOrdersStatusEnum("status").notNull(),
  productId: integer("productId").notNull(),
  employeeId: integer("employeeId").notNull(),
  supplierId: integer("supplierId"),
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
    currentStock: decimal("currentStock", { precision: 19, scale: 4 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
  },
  (table) => ({
    productStock_unique_idx: unique("productStock_employee_product").on(table.employeeId, table.productId),
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
}));

export const supplierBalanceTransactionsTypeEnum = pgEnum("supplierBalanceTransactionType", ["PURCHASE", "ADJUSTMENT", "PAYMENT"]);
export type supplierBalanceTransactionsTypeUnion = typeof supplierBalanceTransactions.$inferSelect.transactionType;

export const supplierBalanceTransactions = pgTable("SupplierBalanceTransactions", {
  id: serial("id").primaryKey(),
  balanceChange: decimal("balanceChange", { precision: 19, scale: 4 }).notNull(),
  transactionType: supplierBalanceTransactionsTypeEnum("transactionType").notNull(),
  notes: text("notes"),
  purchasesOrderId: integer("purchasesOrderId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const supplierBalanceTransactionsRelations = relations(supplierBalanceTransactions, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [supplierBalanceTransactions.purchasesOrderId],
    references: [purchaseOrders.purchaseOrderId],
  }),
}));

export const supplierBalance = pgTable("SupplierBalance", {
  id: serial("id").primaryKey(),
  currentBalance: decimal("currentBalance", { precision: 19, scale: 4 }).notNull(),
  supplierId: integer("supplierId").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }),
});

export const supplierBalanceRelations = relations(supplierBalance, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierBalance.supplierId],
    references: [suppliers.id],
  }),
}));
