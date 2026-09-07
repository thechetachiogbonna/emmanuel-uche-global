import PageHero from "@/components/PageHero";

export default function Hero() {
  return (
    <PageHero
      tag="SS26 — New Collection"
      title={
        <>
          Cut for those
          <br />
          who <span className="italic text-clay">arrive first.</span>
        </>
      }
      description="Emmanuel Uche Global designs ready-to-wear and made-to-order pieces out of Aba — premium fabrics, tailored silhouettes, made to travel."
      primaryCta={{ label: "Shop Collection", href: "/collections" }}
      secondaryCta={{ label: "Our Story", href: "/#story" }}
      image="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80"
      imageAlt="Emmanuel Uche Global SS26 campaign"
    />
  );
}
