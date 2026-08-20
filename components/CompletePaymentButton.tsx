"use client";

import { useState } from "react";
import { retryPaymentAction } from "@/lib/actions/checkout";

export default function CompletePaymentButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    const result = await retryPaymentAction(orderId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = result.authorizationUrl;
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Complete Payment"}
      </button>
      {error && <p className="text-[13px] text-red-700 mt-3 text-center">{error}</p>}
    </div>
  );
}
