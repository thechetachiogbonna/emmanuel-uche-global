"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { placeOrderAction } from "@/lib/actions/checkout";

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

export default function CheckoutForm({ customerName }: { customerName: string }) {
  const router = useRouter();
  const { items, hydrated, subtotalNaira, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    const result = await placeOrderAction(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clear();

    if (result.authorizationUrl) {
      // Full navigation — this is Paystack's own hosted checkout domain,
      // not a route in this app.
      window.location.href = result.authorizationUrl;
      return;
    }

    // Order was created but Paystack init failed (e.g. misconfigured
    // keys) — land on the order page, which offers a retry.
    router.push(`/orders/${result.orderId}`);
  };

  if (!hydrated) {
    return <main className="flex-1 px-6 md:px-10 py-20 md:py-28" />;
  }

  if (items.length === 0) {
    return (
      <main className="flex-1 px-6 md:px-10 py-20 md:py-28 text-center">
        <h1 className="font-display font-light italic text-4xl mb-4">
          Your bag is empty
        </h1>
        <Link
          href="/collections"
          className="inline-block bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors mt-4"
        >
          Shop Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 md:px-10 py-16 md:py-24">
      <h1 className="font-display font-light italic text-4xl mb-2">Checkout</h1>
      <p className="text-[14px] text-ink-soft mb-10">
        Signed in as {customerName}
      </p>

      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <div className="border-t border-ink/10 divide-y divide-ink/10">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- product images are arbitrary external URLs */}
                <img
                  src={item.img1}
                  alt={item.name}
                  className="w-14 h-18 object-cover bg-sand shrink-0"
                />
                <div className="flex-1 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px]">{item.name}</div>
                    <div className="text-[12px] text-ink-soft">Qty {item.quantity}</div>
                  </div>
                  <span className="text-[13px] text-clay shrink-0">
                    {formatNaira(item.priceNaira * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-ink-soft mt-6 bg-sand/30 border border-ink/10 px-4 py-3">
            You&apos;ll be taken to Paystack&apos;s secure checkout to
            complete payment. Your card details are never seen by this site.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border border-ink/10 p-6">
            <div className="flex items-center justify-between text-[14px] mb-2">
              <span className="text-ink-soft">Subtotal</span>
              <span>{formatNaira(subtotalNaira)}</span>
            </div>
            <div className="flex items-center justify-between text-[14px] mb-6 pb-6 border-b border-ink/10">
              <span className="text-ink-soft">Shipping</span>
              <span className="text-ink-soft">Calculated separately</span>
            </div>
            <div className="flex items-center justify-between text-[16px] font-medium mb-6">
              <span>Total</span>
              <span>{formatNaira(subtotalNaira)}</span>
            </div>

            {error && <p className="text-[13px] text-red-700 mb-4">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors disabled:opacity-60"
            >
              {submitting ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
