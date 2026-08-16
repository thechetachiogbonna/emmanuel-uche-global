ALTER TABLE "customers" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" RENAME CONSTRAINT "customers_email_unique" TO "users_email_unique";--> statement-breakpoint
ALTER TABLE "orders" RENAME CONSTRAINT "orders_customer_id_customers_id_fk" TO "orders_customer_id_users_id_fk";--> statement-breakpoint
DROP TABLE "admin_users" CASCADE;
