ALTER TABLE "order_items" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sizes" jsonb DEFAULT '[]'::jsonb NOT NULL;