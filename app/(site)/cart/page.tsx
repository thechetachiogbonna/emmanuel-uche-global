"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, subtotalNaira } = useCart();

  if (!hydrated) {
    return <main className="flex-1 px-6 md:px-10 py-20 md:py-28" />;
  }

  if (items.length === 0) {
    return (
      <main className="flex-1 px-6 md:px-10 py-20 md:py-28 text-center">
        <h1 className="font-display font-light italic text-4xl mb-4">
          Your bag is empty
        </h1>
        <p className="text-[14px] text-ink-soft mb-8">
          Browse the collections and add something you love.
        </p>
        <Link
          href="/collections"
          className="inline-block bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors"
        >
          Shop Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 md:px-10 py-16 md:py-24">
      <h1 className="font-display font-light italic text-4xl mb-10">
        Your Bag
      </h1>

      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-5 py-6">
              <div className="w-24 h-32 bg-sand shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- product images are arbitrary external URLs */}
                <img
                  src={item.img1}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[15px]">{item.name}</span>
                  <span className="text-[14px] text-clay shrink-0">{item.price}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-ink/20">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 text-sm hover:bg-sand/40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-[13px]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 text-sm hover:bg-sand/40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-4">
          <div className="border border-ink/10 p-6">
            <div className="flex items-center justify-between text-[14px] mb-2">
              <span className="text-ink-soft">Subtotal</span>
              <span>{formatNaira(subtotalNaira)}</span>
            </div>
            <p className="text-[12px] text-ink-soft mb-6">
              Shipping and any duties are calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="block text-center bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
