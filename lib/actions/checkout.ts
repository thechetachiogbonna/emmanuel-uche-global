"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByIds } from "@/lib/data";
import { initializeTransaction } from "@/lib/paystack";
import { getBaseUrl } from "@/lib/url";

export type CartLine = { productId: string; quantity: number };

type PlaceOrderResult =
  | { ok: true; orderId: string; authorizationUrl: string }
  | { ok: true; orderId: string; authorizationUrl: null; paymentError: string }
  | { ok: false; error: string };

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function newReference(orderId: string) {
  return `${orderId}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function placeOrderAction(lines: CartLine[]): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You need to be signed in to place an order." };
  }

  const cleanLines = lines.filter((l) => l.quantity > 0);
  if (cleanLines.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  // Look up real, current prices server-side — the client's cart is just
  // a UI convenience, never trusted for the actual charge.
  const productIds = cleanLines.map((l) => l.productId);
  const products = await getProductsByIds(productIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const missing = cleanLines.find((l) => !productMap.has(l.productId));
  if (missing) {
    return {
      ok: false,
      error: "One of the items in your bag is no longer available.",
    };
  }

  let totalNaira = 0;
  let itemCount = 0;
  const itemRows = cleanLines.map((line) => {
    const product = productMap.get(line.productId)!;
    totalNaira += product.priceNaira * line.quantity;
    itemCount += line.quantity;
    return {
      id: newId("oi"),
      orderId: "", // filled in below
      productName: product.name,
      priceNaira: product.priceNaira,
      quantity: line.quantity,
      img1: product.img1,
    };
  });

  const orderId = newId("ord");
  itemRows.forEach((row) => (row.orderId = orderId));
  const reference = newReference(orderId);

  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      customerId: user.id,
      status: "pending",
      paymentStatus: "unpaid",
      paymentReference: reference,
      totalNaira,
      itemCount,
    });
    await tx.insert(orderItems).values(itemRows);
  });

  const baseUrl = await getBaseUrl();
  const init = await initializeTransaction({
    email: user.email,
    amountNaira: totalNaira,
    reference,
    callbackUrl: `${baseUrl}/checkout/callback`,
  });

  if (!init.ok) {
    // The order still exists (status stays pending/unpaid) — the order
    // page offers a "Retry Payment" button rather than losing the order.
    return { ok: true, orderId, authorizationUrl: null, paymentError: init.error };
  }

  return { ok: true, orderId, authorizationUrl: init.authorizationUrl };
}

type RetryResult =
  | { ok: true; authorizationUrl: string }
  | { ok: false; error: string };

export async function retryPaymentAction(orderId: string): Promise<RetryResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You need to be signed in." };
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order || order.customerId !== user.id) {
    return { ok: false, error: "Order not found." };
  }
  if (order.paymentStatus === "paid") {
    return { ok: false, error: "This order is already paid." };
  }

  const reference = newReference(orderId);
  const baseUrl = await getBaseUrl();
  const init = await initializeTransaction({
    email: user.email,
    amountNaira: order.totalNaira,
    reference,
    callbackUrl: `${baseUrl}/checkout/callback`,
  });

  if (!init.ok) {
    return { ok: false, error: init.error };
  }

  await db
    .update(orders)
    .set({ paymentReference: reference, paymentStatus: "unpaid" })
    .where(eq(orders.id, orderId));

  return { ok: true, authorizationUrl: init.authorizationUrl };
}
