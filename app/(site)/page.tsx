import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductRail from "@/components/ProductRail";
import Story from "@/components/Story";
import MadeToOrder from "@/components/MadeToOrder";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <ProductRail />
      <Story />
      <MadeToOrder />
    </main>
  );
}
