DO $$ BEGIN
 CREATE TYPE "purchaseOrdersStatus" AS ENUM('CREATED', 'CANCELLED', 'PAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "salesOrdersStatus" AS ENUM('CREATED', 'CANCELLED', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transactionType" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'CORRECTION', 'TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductStockByEmployee" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"currentStock" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PurchasesOrders" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" "purchaseOrdersStatus",
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SalesOrders" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" "salesOrdersStatus",
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StockTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantityChange" integer NOT NULL,
	"transactionType" "transactionType",
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"salesOrderId" integer NOT NULL,
	"purchasesOrderId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductStockByEmployee" ADD CONSTRAINT "ProductStockByEmployee_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductStockByEmployee" ADD CONSTRAINT "ProductStockByEmployee_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PurchasesOrders" ADD CONSTRAINT "PurchasesOrders_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PurchasesOrders" ADD CONSTRAINT "PurchasesOrders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SalesOrders" ADD CONSTRAINT "SalesOrders_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SalesOrders" ADD CONSTRAINT "SalesOrders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_productId_Products_id_fk" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_salesOrderId_SalesOrders_id_fk" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_purchasesOrderId_PurchasesOrders_id_fk" FOREIGN KEY ("purchasesOrderId") REFERENCES "PurchasesOrders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
