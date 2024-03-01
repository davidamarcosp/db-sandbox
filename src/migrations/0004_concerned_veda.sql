DO $$ BEGIN
 CREATE TYPE "productPricesUnit" AS ENUM('Unit', 'Thousand', 'Million');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductPrices" (
	"id" serial PRIMARY KEY NOT NULL,
	"price" numeric(19, 4) NOT NULL,
	"unit" "productPricesUnit" NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
ALTER TABLE "Products" ADD COLUMN "priceId" integer NOT NULL;