import Link from "next/link";
import type { Collection } from "@/lib/data";

export default function CollectionsGrid({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="flex items-end justify-between border-b border-ink/10 pb-6 mb-10">
        <div>
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3">
            All Collections
          </p>
          <h2 className="font-display font-light italic text-4xl md:text-5xl">
            Shop by Season
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={
              collection.status === "available"
                ? `/collections/${collection.slug}`
                : "#"
            }
            className={`group block ${
              collection.status === "coming-soon"
                ? "pointer-events-none opacity-70"
                : ""
            }`}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-sand mb-5">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
              {collection.status === "coming-soon" && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-ivory/90 text-[10px] tracking-[0.14em] uppercase text-ink">
                  Coming Soon
                </span>
              )}
              <span className="absolute bottom-5 left-5 text-ivory text-[12px] tracking-[0.12em] uppercase">
                {collection.season}
              </span>
            </div>
            <h3 className="font-display font-light italic text-2xl md:text-3xl mb-2 group-hover:text-clay transition-colors">
              {collection.name}
            </h3>
            <p className="text-[14px] leading-relaxed text-ink-soft mb-3">
              {collection.description}
            </p>
            <span className="text-[12px] tracking-[0.12em] uppercase text-clay underline-draw">
              {collection.status === "available"
                ? `${collection.pieceCount} Pieces — View Collection`
                : "Notify Me"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
