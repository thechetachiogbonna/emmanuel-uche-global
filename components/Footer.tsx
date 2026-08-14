import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6 md:px-10 pt-20 pb-10 border-t border-ink/10 bg-ink text-ivory">
      <div className="grid md:grid-cols-12 gap-10 pb-16">
        <div className="md:col-span-4">
          <div className="font-display italic text-3xl mb-5">Uche</div>
          <p className="text-[14px] leading-relaxed text-ivory/60 max-w-xs">
            Ready-to-wear and made-to-order pieces, hand-finished in Aba.
            Rooted in Nigerian craft, made for wherever you&apos;re headed
            next.
          </p>
        </div>

        <div className="md:col-span-2 md:col-start-6">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-gold mb-5">
            Shop
          </h4>
          <ul className="space-y-3 text-[14px] text-ivory/70">
            <li>
              <Link href="/collections" className="hover:text-ivory transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/#made-to-order" className="hover:text-ivory transition-colors">
                Made-to-Order
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-gold mb-5">
            Studio
          </h4>
          <ul className="space-y-3 text-[14px] text-ivory/70">
            <li>
              <Link href="/#story" className="hover:text-ivory transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ivory transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-gold mb-5">
            Join the List
          </h4>
          <p className="text-[13px] text-ivory/60 mb-4">
            10% off your first order, plus early access to new drops.
          </p>
          <form className="flex border-b border-ivory/30 pb-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-transparent flex-1 text-[13px] placeholder:text-ivory/40 outline-none"
            />
            <button type="submit" className="text-[12px] tracking-[0.1em] uppercase text-gold">
              Join →
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-3 border-t border-ivory/10 pt-6 text-[11px] tracking-[0.06em] text-ivory/50">
        <span>© 2026 Uche Fashion International — Aba, Nigeria</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ivory transition-colors">Instagram</a>
          <a href="#" className="hover:text-ivory transition-colors">TikTok</a>
          <a href="#" className="hover:text-ivory transition-colors">Pinterest</a>
        </div>
      </div>
    </footer>
  );
}
