import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import ProductGrid from "@/components/ProductGrid";
import { collections, getCollection } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections
    .filter((c) => c.status === "available")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.name} — Uche Fashion International`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection || collection.status !== "available") {
    notFound();
  }

  return (
    <main className="flex-1">
      <PageHero
        tag={`${collection.season} — Collection`}
        title={
          <>
            {collection.name.split(" ")[0]}
            <br />
            <span className="italic text-clay">
              {collection.name.split(" ").slice(1).join(" ") || collection.name}
            </span>
          </>
        }
        description={collection.description}
        primaryCta={{ label: "All Collections", href: "/collections" }}
        secondaryCta={{ label: "Our Story", href: "/#story" }}
        image={collection.image}
        imageAlt={collection.name}
      />
      <Marquee />
      <ProductGrid
        subtitle="Shop"
        title={collection.name}
        products={collection.products}
      />
    </main>
  );
}
