import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductRail from "@/components/ProductRail";
import Story from "@/components/Story";
import MadeToOrder from "@/components/MadeToOrder";
import { getRandomAvailableProducts } from "@/lib/data";

export default async function Home() {
  const pickedProducts = await getRandomAvailableProducts(6);

  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <ProductRail products={pickedProducts} />
      <Story />
      <MadeToOrder />
    </main>
  );
}
