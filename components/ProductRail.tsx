"use client";

import { useRef } from "react";
import { collections } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function ProductRail() {
  const featured = collections[0];
  const railRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    if (railRef.current) {
      const cardWidth = railRef.current.firstElementChild?.getBoundingClientRect().width || 300;
      const gap = 24;
      railRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (railRef.current) {
      const cardWidth = railRef.current.firstElementChild?.getBoundingClientRect().width || 300;
      const gap = 24;
      railRef.current.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
    }
  };

  return (
    <section id="shop" className="px-6 md:px-10 py-20 md:py-28">
      <div className="flex items-end justify-between border-b border-ink/10 pb-6 mb-10">
        <div>
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3">
            Shop In
          </p>
          <h2 className="font-display font-light italic text-4xl md:text-5xl">
            Collections
          </h2>
        </div>
        <Link
          href="/collections"
          className="hidden md:inline text-[12px] tracking-[0.14em] uppercase underline-draw group"
        >
          <span className="underline-draw">View All</span>
        </Link>
      </div>

      <div className="relative group/rail">
        {/* Previous Button */}
        <button
          onClick={scrollPrev}
          aria-label="Previous Products"
          className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-ivory/90 backdrop-blur-sm border border-ink/10 flex items-center justify-center hover:border-ink hover:text-clay transition-all duration-300 cursor-pointer shadow-sm md:opacity-0 md:group-hover/rail:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Scrollable Rail */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 scroll-px-6 md:scroll-px-0 scrollbar-hide scroll-smooth"
        >
          {featured.products.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              className="shrink-0 w-[78vw] sm:w-[46vw] md:w-[24vw] snap-start"
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={scrollNext}
          aria-label="Next Products"
          className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-ivory/90 backdrop-blur-sm border border-ink/10 flex items-center justify-center hover:border-ink hover:text-clay transition-all duration-300 cursor-pointer shadow-sm md:opacity-0 md:group-hover/rail:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </section>
  );
}
