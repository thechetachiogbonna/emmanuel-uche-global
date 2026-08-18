import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

export async function getMyOrders(customerId: string) {
  const rows = await db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });

  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    total: formatNaira(o.totalNaira),
    itemCount: o.itemCount,
    date: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.productName,
      price: formatNaira(i.priceNaira),
      quantity: i.quantity,
      img1: i.img1,
    })),
  }));
}

export async function getMyOrder(customerId: string, orderId: string) {
  const row = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.customerId, customerId)),
    with: { items: true },
  });
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    total: formatNaira(row.totalNaira),
    itemCount: row.itemCount,
    date: row.createdAt.toISOString(),
    items: row.items.map((i) => ({
      name: i.productName,
      price: formatNaira(i.priceNaira),
      quantity: i.quantity,
      img1: i.img1,
    })),
  };
}
