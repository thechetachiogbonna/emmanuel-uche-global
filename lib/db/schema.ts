import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const collectionStatusEnum = pgEnum("collection_status", [
  "available",
  "coming-soon",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const collections = pgTable("collections", {
  id: varchar("id", { length: 30 }).primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: text("name").notNull(),
  season: text("season").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull(),
  status: collectionStatusEnum("status").notNull().default("coming-soon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id", { length: 30 }).primaryKey(),
  collectionId: varchar("collection_id", { length: 30 })
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Stored as integer kobo-free naira amount; formatted with ₦ at render time.
  priceNaira: integer("price_naira").notNull(),
  img1: text("img1").notNull(),
  img2: text("img2").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 30 }).primaryKey(),
  customerId: varchar("customer_id", { length: 30 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalNaira: integer("total_naira").notNull(),
  itemCount: integer("item_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 30 }).primaryKey(),
  orderId: varchar("order_id", { length: 30 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // No FK to products — if a product is later edited or deleted, this
  // snapshot preserves exactly what the customer actually bought.
  productName: text("product_name").notNull(),
  priceNaira: integer("price_naira").notNull(),
  quantity: integer("quantity").notNull().default(1),
  img1: text("img1").notNull(),
});

export const storeSettings = pgTable("store_settings", {
  id: varchar("id", { length: 20 }).primaryKey().default("default"),
  storeName: text("store_name").notNull(),
  studioLocation: text("studio_location").notNull(),
  supportEmail: text("support_email").notNull(),
  supportPhone: text("support_phone").notNull(),
  hours: text("hours").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(), // random token
  subjectType: varchar("subject_type", { length: 20 }).notNull(), // "customer" | "admin"
  subjectId: varchar("subject_id", { length: 30 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
