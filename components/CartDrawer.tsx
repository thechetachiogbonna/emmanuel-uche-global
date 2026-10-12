"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CartRecommendation } from "@/lib/data";
import { useCart } from "@/lib/cart/CartContext";
import { useCartDrawer } from "@/lib/cart/CartDrawerContext";

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartDrawer({
  recommendations,
}: {
  recommendations: CartRecommendation[];
}) {
  const router = useRouter();
  const { open, closeCart } = useCartDrawer();
  const { items, addItem, updateQuantity, removeItem, subtotalNaira } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const displayedRecommendations = useMemo(() => {
    const cartProductIds = new Set(items.map((item) => item.productId));
    const cartCollectionSlugs = new Set(
      items.flatMap((item) => item.collectionSlug ?? [])
    );

    return recommendations
      .filter((product) => !cartProductIds.has(product.id))
      .sort(
        (a, b) =>
          Number(cartCollectionSlugs.has(b.collectionSlug)) -
          Number(cartCollectionSlugs.has(a.collectionSlug))
      )
      .slice(0, 4);
  }, [items, recommendations]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeCart]);

  const goToCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[95] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden={!open}
      />

      {/* Sliding panel from right */}
      <div
        className={`fixed top-2 right-2 bottom-2 z-[96] w-[calc(100vw-1rem)] max-w-[420px] bg-white rounded-2xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden font-sans text-gray-800 ${
          open ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Cart"
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-5 border-b border-gray-100">
          <h2 className="font-sans text-[13px] font-bold tracking-[0.15em] uppercase text-gray-900">
            YOUR CART
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close Cart"
            className="absolute right-5 text-gray-800 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-[14px] text-gray-500 mb-6 font-light">Your cart is currently empty.</p>
              <button
                onClick={closeCart}
                className="inline-block bg-black text-white text-[11px] tracking-[0.18em] uppercase px-8 py-3.5 hover:bg-gray-800 transition-colors font-medium rounded-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="px-6 py-4 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={`${item.productId}:${item.size ?? ""}`} className="flex gap-4 py-5">
                  <img
                    src={item.img1}
                    alt={item.name}
                    className="w-20 h-24 object-cover bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[12px] font-medium tracking-wide uppercase text-gray-700 leading-snug">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          aria-label={`Remove ${item.name}`}
                          className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                      {item.size && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Size: {item.size}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Widget */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                          className="w-7 h-7 text-xs text-gray-500 hover:text-black transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-[12px] font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                          className="w-7 h-7 text-xs text-gray-500 hover:text-black transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[13px] font-normal text-gray-700">
                        {formatNaira(item.priceNaira * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && displayedRecommendations.length > 0 && (
            <section className="border-t border-gray-100 bg-[#F8F8F8] px-6 py-6">
              <h4 className="mb-5 text-center text-[12px] font-medium tracking-[0.1em] text-gray-600 uppercase">
                YOU MAY ALSO LIKE
              </h4>
              <div className="space-y-4">
                {displayedRecommendations.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <Link
                      href={`/products/${product.id}`}
                      onClick={closeCart}
                      className="h-20 w-16 shrink-0 bg-white"
                      aria-label={`View ${product.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- product images are arbitrary external URLs */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCart}
                        className="block truncate text-[12px] font-medium tracking-wide text-gray-700 uppercase hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-gray-500">
                        {product.price}
                      </p>
                      {product.sizes.length > 0 && (
                        <select
                          aria-label={`Choose a size for ${product.name}`}
                          value={selectedSizes[product.id] ?? ""}
                          onChange={(event) =>
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: event.target.value,
                            }))
                          }
                          className="mt-2 w-full border border-gray-200 bg-white px-2 py-1.5 text-[11px]"
                        >
                          <option value="">Choose size</option>
                          {product.sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          img1: product.image,
                          size: selectedSizes[product.id] || null,
                          collectionSlug: product.collectionSlug,
                        })
                      }
                      disabled={
                        product.sizes.length > 0 && !selectedSizes[product.id]
                      }
                      className="shrink-0 bg-black px-3 py-2.5 text-[11px] font-normal text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add to bag
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Area */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-[13px] font-bold text-gray-900 px-1 pt-1">
              <span>Subtotal</span>
              <span>{formatNaira(subtotalNaira)}</span>
            </div>

            {/* CHECKOUT Button */}
            <button
              onClick={goToCheckout}
              className="w-full bg-black text-white text-[12px] font-bold tracking-[0.2em] uppercase py-4 rounded-md hover:bg-gray-800 transition-colors text-center"
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
