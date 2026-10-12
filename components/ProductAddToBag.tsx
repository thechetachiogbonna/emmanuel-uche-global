"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useCartDrawer } from "@/lib/cart/CartDrawerContext";
import type { ProductDetail } from "@/lib/data";

export default function ProductAddToBag({
  product,
}: {
  product: ProductDetail;
}) {
  const { addItem } = useCart();
  const { openCart } = useCartDrawer();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const image =
    product.media.find((item) => item.type === "image")?.src ??
    product.media[0]?.src ??
    "";

  const handleAddToBag = () => {
    if (product.sizes.length > 0 && !selectedSize) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        img1: image,
        size: selectedSize || null,
        collectionSlug: product.collectionSlug,
      },
      quantity
    );
    openCart();
  };

  return (
    <div>
      {product.sizes.length > 0 && (
        <fieldset className="mb-8">
          <legend className="mb-3 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Size
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-10 border px-3 py-2 text-[12px] transition-colors ${
                  selectedSize === size
                    ? "border-ink bg-ink text-ivory"
                    : "border-transparent hover:border-ink/30"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex gap-3">
        <div className="flex h-12 shrink-0 items-center border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="h-full w-10 text-sm text-ink-soft hover:text-ink"
          >
            −
          </button>
          <span className="w-8 text-center text-[12px]" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            aria-label="Increase quantity"
            className="h-full w-10 text-sm text-ink-soft hover:text-ink"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToBag}
          disabled={product.sizes.length > 0 && !selectedSize}
          className="flex-1 bg-ink px-4 py-3 text-[12px] uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Bag
        </button>
      </div>
      {product.sizes.length > 0 && !selectedSize && (
        <p className="mt-2 text-[11px] text-ink-soft">
          Select a size to add this piece to your bag.
        </p>
      )}
    </div>
  );
}
