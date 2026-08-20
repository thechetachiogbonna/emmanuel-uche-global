import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyTransaction } from "@/lib/paystack";

type ConfirmResult =
  | { ok: true; orderId: string; alreadyProcessed: boolean }
  | { ok: false; error: string };

/**
 * The single source of truth for "did this payment actually succeed" —
 * called from both the webhook handler and the browser callback page, so
 * whichever arrives first does the work and the other is a safe no-op.
 *
 * Always re-verifies against Paystack's own /transaction/verify endpoint
 * rather than trusting the reference alone — a webhook body or callback
 * query string can be replayed/forged, but Paystack's server-to-server
 * answer (keyed by our secret key) cannot.
 */
export async function confirmOrderPayment(reference: string): Promise<ConfirmResult> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.paymentReference, reference),
  });

  if (!order) {
    return { ok: false, error: "No order matches this payment reference." };
  }

  // Idempotent: webhook and callback commonly race, or a webhook retries.
  if (order.paymentStatus === "paid") {
    return { ok: true, orderId: order.id, alreadyProcessed: true };
  }

  const verification = await verifyTransaction(reference);
  if (!verification.ok) {
    return { ok: false, error: verification.error };
  }

  if (!verification.success) {
    await db
      .update(orders)
      .set({ paymentStatus: "failed" })
      .where(eq(orders.id, order.id));
    return { ok: false, error: "Payment was not successful." };
  }

  // Defend against a tampered/mismatched amount even though the reference
  // matched — trust the amount Paystack confirms, not what we expected.
  if (verification.amountNaira !== order.totalNaira) {
    return {
      ok: false,
      error: "Paid amount does not match the order total.",
    };
  }

  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "processing" })
    .where(eq(orders.id, order.id));

  return { ok: true, orderId: order.id, alreadyProcessed: false };
}
