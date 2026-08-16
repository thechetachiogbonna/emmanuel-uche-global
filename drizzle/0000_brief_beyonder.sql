CREATE TYPE "public"."collection_status" AS ENUM('available', 'coming-soon');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"season" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" text NOT NULL,
	"status" "collection_status" DEFAULT 'coming-soon' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"customer_id" varchar(30) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_naira" integer NOT NULL,
	"item_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"collection_id" varchar(30) NOT NULL,
	"name" text NOT NULL,
	"price_naira" integer NOT NULL,
	"img1" text NOT NULL,
	"img2" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"subject_type" varchar(20) NOT NULL,
	"subject_id" varchar(30) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;