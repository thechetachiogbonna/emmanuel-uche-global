import type { Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
  products,
  title,
  subtitle,
}: {
  products: Product[];
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="flex items-end justify-between border-b border-ink/10 pb-6 mb-10">
        <div>
          {subtitle && (
            <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3">
              {subtitle}
            </p>
          )}
          <h2 className="font-display font-light italic text-4xl md:text-5xl">
            {title}
          </h2>
        </div>
        <span className="hidden md:inline text-[12px] tracking-[0.12em] uppercase text-ink-soft">
          {products.length} Pieces
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
