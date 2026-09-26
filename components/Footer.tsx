import Link from "next/link";
import { getStoreSettings } from "@/lib/admin/queries";

export default async function Footer() {
  const settings = await getStoreSettings();

  return (
    <footer className="px-6 md:px-10 pt-20 pb-10 border-t border-ink/10 bg-sand/30 text-ink">
      <div className="grid md:grid-cols-12 gap-10 pb-16">
        <div className="md:col-span-4">
          <div className="font-display italic text-3xl mb-5">Emmanuel Uche</div>
          <p className="text-[14px] leading-relaxed text-ink-soft max-w-xs">
            Ready-to-wear and made-to-order pieces, hand-finished in{" "}
            {settings.studioLocation}. Rooted in Nigerian craft, made for
            wherever you&apos;re headed next.
          </p>
        </div>

        <div className="md:col-span-2 md:col-start-6">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-clay mb-5">
            Shop
          </h4>
          <ul className="space-y-3 text-[14px] text-ink-soft">
            <li>
              <Link href="/collections" className="hover:text-ink transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/#made-to-order" className="hover:text-ink transition-colors">
                Made-to-Order
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-clay mb-5">
            Studio
          </h4>
          <ul className="space-y-3 text-[14px] text-ink-soft">
            <li>
              <Link href="/#story" className="hover:text-ink transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${settings.supportEmail}`}
                className="hover:text-ink transition-colors"
              >
                {settings.supportEmail}
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] tracking-[0.14em] uppercase text-clay mb-5">
            Join the List
          </h4>
          <p className="text-[13px] text-ink-soft mb-4">
            10% off your first order, plus early access to new drops.
          </p>
          <form className="flex border-b border-ink/20 pb-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-transparent flex-1 text-[13px] placeholder:text-ink-soft/60 outline-none"
            />
            <button type="submit" className="text-[12px] tracking-[0.1em] uppercase text-clay">
              Join →
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-3 border-t border-ink/10 pt-6 text-[11px] tracking-[0.06em] text-ink-soft">
        <span>
          © 2026 {settings.storeName} — {settings.studioLocation}
        </span>
        <div />
      </div>
    </footer>
  );
}
