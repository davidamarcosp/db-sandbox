ALTER TABLE "PurchasesOrders" ALTER COLUMN "quantity" SET DATA TYPE numeric(19, 4);--> statement-breakpoint
ALTER TABLE "SalesOrders" ALTER COLUMN "quantity" SET DATA TYPE numeric(19, 4);--> statement-breakpoint
ALTER TABLE "SalesOrders" ADD COLUMN "quantityDelivered" numeric(19, 4) DEFAULT '0' NOT NULL;