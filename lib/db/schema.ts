import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
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

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "failed",
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

// ---- Better Auth core schema (generated via `npx auth generate`, then
// merged in here alongside the app's own tables) ----

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  // Added by the admin plugin — "admin" vs the default "user" role is how
  // this project now distinguishes the admin console from customers,
  // replacing the old ADMIN_EMAIL-string-match approach.
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    // Email/password credentials live here (providerId "credential"), not
    // on the user row — Better Auth treats email/password as just one of
    // several possible sign-in providers per user.
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("accounts_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId
    ),
    index("accounts_userId_idx").on(table.userId),
  ]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
);

// ---- App-specific tables ----

export const orders = pgTable("orders", {
  id: varchar("id", { length: 30 }).primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  // The reference sent to Paystack for the most recent payment attempt.
  // Regenerated on each retry, so it's how we match an inbound webhook
  // or callback back to this order.
  paymentReference: varchar("payment_reference", { length: 100 }).unique(),
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

// ---- Relations ----

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
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
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
