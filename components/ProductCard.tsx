"use client";

import MediaCarousel, { type MediaItem } from "@/components/MediaCarousel";
import type { Product } from "@/lib/data";

export default function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const media: MediaItem[] = [
    { src: product.img1, type: "image", alt: product.name },
    { src: product.img2, type: "image", alt: `${product.name} alternate view` },
  ].filter((item) => item.src);

  return (
    <div className={`group ${className}`}>
      <div className="relative aspect-10/13 overflow-hidden bg-sand">
        <MediaCarousel items={media} label={product.name} variant="product" />
      </div>
      <div className="flex items-center justify-between mt-4 gap-4">
        <span className="text-[14px] underline-draw">{product.name}</span>
        <span className="text-[13px] text-clay shrink-0">{product.price}</span>
      </div>
    </div>
  );
}
