import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collections as collectionsTable,
  products as productsTable,
  orders as ordersTable,
  users as usersTable,
  storeSettings as storeSettingsTable,
} from "@/lib/db/schema";

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

export async function getAdminCollections() {
  const rows = await db.query.collections.findMany({
    orderBy: [asc(collectionsTable.createdAt)],
    with: { products: { orderBy: [asc(productsTable.createdAt)] } },
  });

  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    season: c.season,
    description: c.description,
    image: c.image,
    status: c.status,
    products: c.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: formatNaira(p.priceNaira),
      img1: p.img1,
      img2: p.img2,
    })),
  }));
}

export async function getAdminOrders() {
  const rows = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentStatus: ordersTable.paymentStatus,
      totalNaira: ordersTable.totalNaira,
      itemCount: ordersTable.itemCount,
      createdAt: ordersTable.createdAt,
      customerName: usersTable.name,
      customerEmail: usersTable.email,
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.customerId, usersTable.id))
    .orderBy(desc(ordersTable.createdAt));

  return rows.map((o) => ({
    id: o.id,
    customer: o.customerName,
    email: o.customerEmail,
    date: o.createdAt.toISOString(),
    items: o.itemCount,
    total: formatNaira(o.totalNaira),
    status: o.status,
    paymentStatus: o.paymentStatus,
  }));
}

export async function getAdminCustomers() {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      joined: usersTable.createdAt,
      orders: sql<number>`count(${ordersTable.id})`.mapWith(Number),
      totalSpent: sql<number>`coalesce(sum(${ordersTable.totalNaira}), 0)`.mapWith(Number),
    })
    .from(usersTable)
    .leftJoin(ordersTable, eq(ordersTable.customerId, usersTable.id))
    .groupBy(usersTable.id)
    .orderBy(desc(usersTable.createdAt));

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    joined: c.joined.toISOString(),
    orders: c.orders,
    totalSpent: formatNaira(c.totalSpent),
  }));
}

export async function getStoreSettings() {
  const rows = await db.select().from(storeSettingsTable).limit(1);
  const row = rows[0];
  return (
    row ?? {
      id: "default",
      storeName: "Uche Fashion International",
      studioLocation: "Aba, Nigeria",
      supportEmail: "hello@uchefashion.com",
      supportPhone: "+234 801 234 5678",
      hours: "Mon–Fri, 9am–6pm WAT",
      updatedAt: new Date(),
    }
  );
}
