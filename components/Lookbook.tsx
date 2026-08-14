const images = [
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    caption: "Look 01 — Arrival",
  },
  {
    src: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=800&q=80",
    caption: "Look 04 — Market Day",
  },
  {
    src: "https://images.unsplash.com/photo-1521123845560-14093637aa7d?w=800&q=80",
    caption: "Look 07 — Golden Hour",
  },
];

export default function Lookbook() {
  return (
    <section id="lookbook" className="py-20 md:py-28">
      <div className="px-6 md:px-10 flex items-end justify-between border-b border-ink/10 pb-6 mb-10">
        <div>
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3">
            Lookbook
          </p>
          <h2 className="font-display font-light italic text-4xl md:text-5xl">
            Field Notes, Lagos
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {images.map((img) => (
          <div key={img.caption} className="relative aspect-[3/4] group overflow-hidden">
            <img
              src={img.src}
              alt={img.caption}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 text-ivory text-[12px] tracking-[0.12em] uppercase">
              {img.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
