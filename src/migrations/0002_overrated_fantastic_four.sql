ALTER TABLE "ProductStockTransactions" RENAME COLUMN "quantityChange" TO "stockChange";--> statement-breakpoint
ALTER TABLE "ProductStockTransactions" RENAME COLUMN "purchasesOrderId" TO "purchaseOrderId";--> statement-breakpoint
ALTER TABLE "PurchasesOrders" RENAME COLUMN "id" TO "purchaseOrderId";--> statement-breakpoint
ALTER TABLE "SalesOrders" RENAME COLUMN "id" TO "salesOrderId";--> statement-breakpoint
ALTER TABLE "ProductStock" ALTER COLUMN "currentStock" SET DATA TYPE numeric(19, 4);--> statement-breakpoint
ALTER TABLE "ProductStockTransactions" ALTER COLUMN "stockChange" SET DATA TYPE numeric(19, 4);--> statement-breakpoint
ALTER TABLE "SupplierBalance" ALTER COLUMN "currentBalance" SET DATA TYPE numeric(19, 4);--> statement-breakpoint
ALTER TABLE "SupplierBalance" ALTER COLUMN "supplierId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Employees" ADD COLUMN "discordId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Games" ADD COLUMN "shortCode" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Products" ADD COLUMN "gameRealmId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "PurchasesOrders" ADD COLUMN "price" numeric(19, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "PurchasesOrders" ADD COLUMN "rate" numeric(19, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "SalesOrders" ADD COLUMN "price" numeric(19, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "SalesOrders" ADD COLUMN "rate" numeric(19, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_discordId_unique" UNIQUE("discordId");--> statement-breakpoint
ALTER TABLE "GameRealms" ADD CONSTRAINT "gameRealms_game_server" UNIQUE("gameId","server");--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "game_short_code_idx" UNIQUE("shortCode");--> statement-breakpoint
ALTER TABLE "ProductCategories" ADD CONSTRAINT "productCategory" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "ProductStock" ADD CONSTRAINT "productStock_employee_product_gameRealm" UNIQUE("employeeId","productId","gameRealmId");--> statement-breakpoint
ALTER TABLE "Products" ADD CONSTRAINT "products_game_gameRealm_productCategory" UNIQUE("gameId","gameRealmId","productCategoryId");