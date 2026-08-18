"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart/CartContext";

export default function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      img1: product.img1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className={`group ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        <img
          src={product.img1}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover card-fade"
          style={{ opacity: hover ? 0 : 1 }}
        />
        <img
          src={product.img2}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 w-full h-full object-cover card-fade"
          style={{ opacity: hover ? 1 : 0 }}
        />

        <button
          onClick={handleAdd}
          className="absolute bottom-0 left-0 right-0 bg-ink text-ivory text-[11px] tracking-[0.14em] uppercase py-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-clay"
        >
          {added ? "Added ✓" : "Add to Bag"}
        </button>
      </div>
      <div className="flex items-center justify-between mt-4 gap-4">
        <span className="text-[14px] underline-draw">{product.name}</span>
        <span className="text-[13px] text-clay shrink-0">{product.price}</span>
      </div>
    </div>
  );
}
