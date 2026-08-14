"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";

export default function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

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
      </div>
      <div className="flex items-center justify-between mt-4 gap-4">
        <span className="text-[14px] underline-draw">{product.name}</span>
        <span className="text-[13px] text-clay shrink-0">{product.price}</span>
      </div>
    </div>
  );
}
