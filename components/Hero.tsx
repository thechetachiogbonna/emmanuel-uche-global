import PageHero from "@/components/PageHero";

export default function Hero() {
  return (
    <PageHero
      tag="SS26 — New Collection"
      title={
        <>
          Style that
          <br />
          <span className="italic text-clay">speaks before you do.</span>
        </>
      }
      description="Hand-finished in our Aba studio from fabrics chosen for how they move, not just how they look — ready-to-wear and made-to-order pieces built for wherever the day takes you."
      primaryCta={{ label: "Shop Collection", href: "/collections" }}
      secondaryCta={{ label: "Our Story", href: "/#story" }}
      videos={[
        "/videos/VID-20260922-WA0016.mp4",
        "/videos/VID-20260922-WA0017.mp4",
      ]}
      image="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80"
      imageAlt="Emmanuel Uche Global SS26 campaign"
    />
  );
}
