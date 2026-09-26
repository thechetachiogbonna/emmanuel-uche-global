export default function Story() {
  return (
    <section id="story" className="px-6 md:px-10 py-20 md:py-28 bg-sand/30">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <div className="md:col-span-5 aspect-4/5 overflow-hidden">
          <img
            src="/images/IMG-20260922-WA0015.jpg"
            alt="Emmanuel Uche Global studio in Aba"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-5">
            Our Story
          </p>
          <h2 className="font-display font-light text-3xl md:text-[2.6rem] leading-tight mb-6">
            Every piece starts with cloth,
            <br className="hidden md:block" /> not a sketch.
          </h2>
          <p className="text-[15px] leading-relaxed text-ink-soft max-w-md mb-4">
            Emmanuel Uche Global selects and cuts every fabric directly in our
            Aba studio. The fabric dictates the silhouette — not the other way around.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-soft max-w-md mb-8">
            Every garment is finished in our Aba studio and made to order,
            so nothing sits in a warehouse waiting for a buyer.
          </p>
          <div className="flex gap-10 border-t border-ink/15 pt-6">
            <div>
              <div className="font-display text-2xl text-clay">10 Days</div>
              <div className="text-[10px] tracking-widest uppercase text-ink-soft mt-1">
                Made to Order
              </div>
            </div>
            <div>
              <div className="font-display text-2xl text-clay">100%</div>
              <div className="text-[10px] tracking-widest uppercase text-ink-soft mt-1">
                In-house & Hand-finished
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
