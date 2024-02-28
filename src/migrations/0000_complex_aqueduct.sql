DO $$ BEGIN
 CREATE TYPE "productStockTransactionType" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'CORRECTION', 'TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
 CREATE TYPE "supplierBalanceTransactionType" AS ENUM('PURCHASE', 'ADJUSTMENT', 'PAYMENT');
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
CREATE TABLE IF NOT EXISTS "GameRealms" (
	"id" serial PRIMARY KEY NOT NULL,
	"server" varchar(255) DEFAULT 'Main Server' NOT NULL,
	"region" varchar(255),
	"attributes" json DEFAULT '{}'::json,
	"gameId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Games" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductCategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductStock" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"gameRealmId" integer NOT NULL,
	"currentStock" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3),
	CONSTRAINT "employee_product_gameRealm" UNIQUE("employeeId","productId","gameRealmId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductStockTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantityChange" integer NOT NULL,
	"transactionType" "productStockTransactionType" NOT NULL,
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"gameRealmId" integer NOT NULL,
	"salesOrderId" integer,
	"purchasesOrderId" integer,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"gameId" integer NOT NULL,
	"productCategoryId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PurchasesOrders" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"status" "purchaseOrdersStatus",
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"supplierId" integer,
	"gameRealmId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SalesOrders" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"status" "salesOrdersStatus",
	"productId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"gameRealmId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SupplierBalance" (
	"id" serial PRIMARY KEY NOT NULL,
	"currentBalance" integer NOT NULL,
	"supplierId" integer,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SupplierBalanceTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantityChange" numeric(19, 4) NOT NULL,
	"transactionType" "supplierBalanceTransactionType" NOT NULL,
	"notes" text,
	"purchasesOrderId" integer,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
