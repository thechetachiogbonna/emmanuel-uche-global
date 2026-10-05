import Link from "next/link";
import MediaCarousel from "@/components/MediaCarousel";

export default function MadeToOrder() {
  return (
    <section id="made-to-order" className="px-6 md:px-10 py-20 md:py-28 border-t border-ink/10 bg-ivory">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* Left Column: Typography & Steps */}
        <div className="md:col-span-6 order-2 md:order-1">
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-5">
            Custom Tailoring
          </p>
          <h2 className="font-display font-light text-3xl md:text-[2.6rem] leading-tight mb-8">
            Made to Order,
            <br />
            Fit to Travel.
          </h2>

          <div className="flex flex-col gap-8 mb-10">
            {/* Step 1 */}
            <div className="flex gap-5">
              <span className="font-display italic text-2xl text-clay select-none shrink-0 w-8">
                01
              </span>
              <div>
                <h3 className="text-[13px] tracking-[0.12em] uppercase font-semibold text-ink mb-1.5">
                  Select Silhouette
                </h3>
                <p className="text-[14px] leading-relaxed text-ink-soft max-w-md">
                  Choose from our seasonal ready-to-wear shapes and signature templates that suit your occasion.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5">
              <span className="font-display italic text-2xl text-clay select-none shrink-0 w-8">
                02
              </span>
              <div>
                <h3 className="text-[13px] tracking-[0.12em] uppercase font-semibold text-ink mb-1.5">
                  Provide Measurements
                </h3>
                <p className="text-[14px] leading-relaxed text-ink-soft max-w-md">
                  Submit your standard dimensions or book a direct, virtual 1-on-1 measurement session with our studio team.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5">
              <span className="font-display italic text-2xl text-clay select-none shrink-0 w-8">
                03
              </span>
              <div>
                <h3 className="text-[13px] tracking-[0.12em] uppercase font-semibold text-ink mb-1.5">
                  Studio Crafted
                </h3>
                <p className="text-[14px] leading-relaxed text-ink-soft max-w-md">
                  Each garment is individually hand-cut and custom tailored in our Aba studio within 1 to 2 weeks.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase hover:bg-clay transition-colors"
          >
            Chat Us On WhatsApp
          </Link>
        </div>

        {/* Right Column: Made-to-order videos */}
        <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 aspect-[4/5] overflow-hidden bg-sand">
          <MediaCarousel
            label="Made-to-order studio videos"
            variant="product"
            advanceOnVideoEnd
            items={[
              {
                src: "/videos/made-to-order-1.mp4",
                type: "video",
                alt: "Emmanuel Uche Global made-to-order studio video 1",
              },
              {
                src: "/videos/made-to-order-2.mp4",
                type: "video",
                alt: "Emmanuel Uche Global made-to-order studio video 2",
              },
              {
                src: "/videos/made-to-order-3.mp4",
                type: "video",
                alt: "Emmanuel Uche Global made-to-order studio video 3",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
