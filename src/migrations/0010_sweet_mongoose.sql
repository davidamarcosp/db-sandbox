DROP TABLE "ProductPrices";--> statement-breakpoint
ALTER TABLE "ProductStock" DROP CONSTRAINT "productStock_employee_product_gameRealm";--> statement-breakpoint
ALTER TABLE "Products" DROP CONSTRAINT "products_game_gameRealm_productCategory";--> statement-breakpoint
ALTER TABLE "Products" ADD COLUMN "price" numeric(19, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "Products" ADD COLUMN "unit" "productPricesUnit" NOT NULL;--> statement-breakpoint
ALTER TABLE "ProductStock" DROP COLUMN IF EXISTS "gameRealmId";--> statement-breakpoint
ALTER TABLE "ProductStockTransactions" DROP COLUMN IF EXISTS "gameRealmId";--> statement-breakpoint
ALTER TABLE "Products" DROP COLUMN IF EXISTS "gameId";--> statement-breakpoint
ALTER TABLE "PurchasesOrders" DROP COLUMN IF EXISTS "gameRealmId";--> statement-breakpoint
ALTER TABLE "SalesOrders" DROP COLUMN IF EXISTS "gameRealmId";--> statement-breakpoint
ALTER TABLE "ProductStock" ADD CONSTRAINT "productStock_employee_product" UNIQUE("employeeId","productId");--> statement-breakpoint
ALTER TABLE "Products" ADD CONSTRAINT "products_gameRealm_productCategory" UNIQUE("gameRealmId","productCategoryId");