"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";

export default function ProductRail({ products }: { products: Product[] }) {
  return (
    <section id="shop" className="px-6 py-10 md:px-10 md:py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-clay">
            Shop In
          </p>
          <h2 className="font-display text-4xl font-light italic md:text-5xl">
            Collections
          </h2>
        </div>
        <Link
          href="/collections"
          className="text-[11px] uppercase tracking-[0.14em] underline-draw group"
        >
          <span className="underline-draw">Shop</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
