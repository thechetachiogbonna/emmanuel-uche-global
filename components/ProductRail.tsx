"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";

export default function ProductRail({ products }: { products: Product[] }) {
  return (
    <section id="shop" className="px-6 py-10 md:px-10 md:py-12">
      <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-clay">
            Back in Stock
          </p>
          <h2 className="font-display text-3xl font-light uppercase tracking-[0.04em] md:text-4xl">
            The Icons
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
