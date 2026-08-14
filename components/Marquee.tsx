const items = [
  "Hand-finished in Aba",
  "SS26 — New Collection",
  "Made-to-order in 10 days",
  "Shipping to Aba, London, Accra",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="border-y border-ink/10 bg-sand/40 py-3 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="mx-8 text-[12px] tracking-[0.14em] uppercase text-ink-soft"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
