import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { confirmOrderPayment } from "@/lib/payments";

/**
 * Paystack's authoritative payment notification. The browser callback
 * (/checkout/callback) gives the customer instant feedback, but a closed
 * tab or network drop can skip it — this is what actually guarantees the
 * order gets marked paid. Must return 200 quickly; Paystack retries on
 * anything else, for up to 72 hours.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Deliberately vague — don't help an attacker iterate.
    return new NextResponse("Invalid signature", { status: 400 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    // Errors here shouldn't turn into Paystack retry storms for something
    // already logged — always ack once the signature is valid.
    try {
      await confirmOrderPayment(event.data.reference);
    } catch (err) {
      console.error("Webhook confirmOrderPayment failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
