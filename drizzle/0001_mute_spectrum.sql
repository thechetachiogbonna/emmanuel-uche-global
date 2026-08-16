CREATE TABLE "store_settings" (
	"id" varchar(20) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"store_name" text NOT NULL,
	"studio_location" text NOT NULL,
	"support_email" text NOT NULL,
	"support_phone" text NOT NULL,
	"hours" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
