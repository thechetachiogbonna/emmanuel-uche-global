import type { Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
  products,
  title,
  subtitle,
  description,
}: {
  products: Product[];
  title: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <section className="px-4 md:px-8 xl:px-10 pt-12 md:pt-16 pb-20 md:pb-28">
      <div className="flex items-end justify-between gap-6 border-b border-ink/10 pb-6 mb-7">
        <div>
          {subtitle && (
            <p className="text-[11px] tracking-[0.16em] uppercase text-clay mb-2">
              {subtitle}
            </p>
          )}
          <h1 className="font-display font-light text-3xl md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[11px] tracking-widest uppercase text-ink-soft">
          {products.length} Pieces
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-9 md:gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
