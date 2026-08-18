"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof STATUSES)[number];

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  await requireAdmin();
  if (!STATUSES.includes(status)) {
    return { ok: false as const, error: "Invalid status." };
  }
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true as const };
}
