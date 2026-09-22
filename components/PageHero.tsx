import Link from "next/link";

type PageHeroProps = {
  tag: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image?: string;
  imageAlt?: string;
  videos?: string[];
};

export default function PageHero({
  tag,
  title,
  description,
  primaryCta,
  secondaryCta,
  image,
  imageAlt,
  videos,
}: PageHeroProps) {
  const heroVideos = videos?.length ? videos : [];
  return (
    <section className="relative overflow-hidden px-6 md:px-10 pt-10 md:pt-16 pb-16">
      <span className="watermark-u absolute -top-6 -left-4 md:-top-8 md:-left-8 text-[22vw] md:text-[18rem] leading-none whitespace-nowrap select-none">
        Uche
      </span>

      <div className="relative grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7 relative z-10">
          <p className="text-[12px] tracking-[0.2em] uppercase text-clay mb-5">
            {tag}
          </p>
          <h1 className="font-display font-light text-[13vw] md:text-[6.2vw] leading-[0.92] tracking-tight">
            {title}
          </h1>
        </div>

        {(description || primaryCta || secondaryCta) && (
          <div className="md:col-span-4 md:col-start-9 relative z-10 flex flex-col gap-5 pb-2">
            {description && (
              <p className="text-[15px] leading-relaxed text-ink-soft max-w-xs">
                {description}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap gap-3">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="px-6 py-3.5 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase hover:bg-clay transition-colors"
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="px-6 py-3.5 border border-ink/20 text-[12px] tracking-[0.14em] uppercase hover:border-ink transition-colors"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {(image || heroVideos.length > 0) && (
        <div className={`relative mt-12 md:mt-16 overflow-hidden ${heroVideos.length > 0 ? "grid grid-cols-2 bg-sand" : "aspect-16/8 md:aspect-16/7 bg-sand"}`}>
          {heroVideos.length > 0 ? (
            heroVideos.map((source, index) => (
              <video
                key={source}
                className="block aspect-9/16 w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                aria-label={`${imageAlt ?? "Uche Fashion International campaign"} ${index + 1}`}
              >
                <source src={source} type="video/mp4" />
              </video>
            ))
          ) : (
            <img
              src={image}
              alt={imageAlt ?? ""}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}
    </section>
  );
}
