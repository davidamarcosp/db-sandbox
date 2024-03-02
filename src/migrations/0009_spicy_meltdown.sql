CREATE TABLE IF NOT EXISTS "Marketplaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3),
	CONSTRAINT "marketplaceName" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "SalesOrders" ADD COLUMN "marketplaceId" integer NOT NULL;