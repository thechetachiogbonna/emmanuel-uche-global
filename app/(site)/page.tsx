import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductRail from "@/components/ProductRail";
import Story from "@/components/Story";
import MadeToOrder from "@/components/MadeToOrder";
import { getCollections } from "@/lib/data";

export default async function Home() {
  const collections = await getCollections();
  const featured = collections[0];

  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <ProductRail products={featured?.products ?? []} />
      <Story />
      <MadeToOrder />
    </main>
  );
}
