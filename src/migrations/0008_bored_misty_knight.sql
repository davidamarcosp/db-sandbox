ALTER TABLE "SupplierBalanceTransactions" RENAME COLUMN "quantityChange" TO "balanceChange";--> statement-breakpoint
ALTER TABLE "PurchasesOrders" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "SalesOrders" ALTER COLUMN "status" SET NOT NULL;