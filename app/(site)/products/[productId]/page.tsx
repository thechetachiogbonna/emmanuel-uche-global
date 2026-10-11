import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaCarousel, { type MediaItem } from "@/components/MediaCarousel";
import ProductAddToBag from "@/components/ProductAddToBag";
import { getProductById } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);

  return {
    title: product
      ? `${product.name} — Emmanuel Uche Global`
      : "Product Not Found",
  };
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) notFound();

  const media: MediaItem[] = product.media.map((item, index) => ({
    ...item,
    alt: index === 0 ? product.name : `${product.name} image ${index + 1}`,
  }));

  return (
    <main className="flex-1 px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-10/13 overflow-hidden bg-sand">
          <MediaCarousel items={media} label={product.name} variant="product" />
        </div>

        <div className="flex flex-col justify-center">
          <Link
            href={`/collections/${product.collectionSlug}`}
            className="mb-4 text-[11px] uppercase tracking-[0.16em] text-clay underline-draw"
          >
            {product.collectionSeason} · {product.collectionName}
          </Link>
          <h1 className="font-display text-4xl font-light md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-[15px] text-clay">{product.price}</p>
          <div className="my-8 border-t border-ink/10" />
          <ProductAddToBag product={product} />
          <Link
            href={`/collections/${product.collectionSlug}`}
            className="mt-6 text-center text-[11px] uppercase tracking-[0.14em] underline-draw"
          >
            View collection
          </Link>
        </div>
      </div>
    </main>
  );
}
