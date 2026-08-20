import "server-only";
import crypto from "crypto";

/**
 * Thin wrapper around Paystack's REST API. Server-only — the secret key
 * must never reach the browser. Uses the standard Initialize/Verify flow
 * (redirect to Paystack's hosted checkout) rather than Inline/Popup JS,
 * so no Paystack script or public key is needed on the frontend at all.
 *
 * Docs referenced (current as of this writing):
 *   https://paystack.com/docs/payments/accept-payments/
 *   https://paystack.com/docs/payments/verify-payments/
 *   https://paystack.com/docs/payments/webhooks/
 */

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your .env — see .env.example."
    );
  }
  return key;
}

type InitializeResult =
  | { ok: true; authorizationUrl: string; accessCode: string; reference: string }
  | { ok: false; error: string };

export async function initializeTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  let secretKey: string;
  try {
    secretKey = getSecretKey();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountNaira * 100, // Paystack expects kobo
        reference: params.reference,
        callback_url: params.callbackUrl,
        currency: "NGN",
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.status) {
      return {
        ok: false,
        error: json.message ?? `Paystack returned ${res.status}`,
      };
    }

    return {
      ok: true,
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
    };
  } catch (e) {
    return {
      ok: false,
      error: `Could not reach Paystack: ${(e as Error).message}`,
    };
  }
}

type VerifyResult =
  | {
      ok: true;
      success: boolean; // true only if Paystack reports the charge succeeded
      amountNaira: number;
      reference: string;
      gatewayResponse: string;
    }
  | { ok: false; error: string };

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  let secretKey: string;
  try {
    secretKey = getSecretKey();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  try {
    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      }
    );

    const json = await res.json();

    if (!res.ok || !json.status) {
      return {
        ok: false,
        error: json.message ?? `Paystack returned ${res.status}`,
      };
    }

    return {
      ok: true,
      success: json.data.status === "success",
      amountNaira: Math.round(json.data.amount / 100),
      reference: json.data.reference,
      gatewayResponse: json.data.gateway_response ?? "",
    };
  } catch (e) {
    return {
      ok: false,
      error: `Could not reach Paystack: ${(e as Error).message}`,
    };
  }
}

/**
 * Verifies the x-paystack-signature header on an inbound webhook.
 * MUST be computed over the raw request body text — re-serializing a
 * parsed JSON object can produce different bytes (key order, whitespace)
 * and silently break verification. Uses HMAC-SHA512, not SHA-256.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
