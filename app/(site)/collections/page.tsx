import type { Metadata } from "next";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import CollectionsGrid from "@/components/CollectionsGrid";
import { collections } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections — Uche Fashion International",
  description:
    "Browse ready-to-wear and made-to-order collections from Uche Fashion International.",
};

export default function CollectionsPage() {
  return (
    <main className="flex-1">
      <PageHero
        tag="Shop"
        title={
          <>
            Our
            <br />
            <span className="italic text-clay">Collections</span>
          </>
        }
        description={
          <>
            Seasonal ready-to-wear and made-to-order pieces, hand-finished in{" "}
            <span className="text-clay font-semibold">Our Studio</span> with precision tailoring.
          </>
        }
        primaryCta={{ label: "New Collection", href: "/collections/ss26-new-collection" }}
        secondaryCta={{ label: "Back to Home", href: "/" }}
        image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
        imageAlt="Uche Fashion International collections"
      />
      <Marquee />
      <CollectionsGrid collections={collections} />
    </main>
  );
}
