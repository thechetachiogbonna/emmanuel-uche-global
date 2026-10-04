"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import type { CollectionLink } from "@/lib/data";
import { useCart } from "@/lib/cart/CartContext";
import { useCartDrawer } from "@/lib/cart/CartDrawerContext";
import AccountDrawer from "@/components/AccountDrawer";

const links = [
  { label: "Shop", href: "/#shop" },
  { label: "Story", href: "/#story" },
  { label: "Made-to-Order", href: "/#made-to-order" },
];

type Session = { name: string; email: string } | null;

export default function Nav({
  session,
  collections,
}: {
  session: Session;
  collections: CollectionLink[];
}) {
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { itemCount } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuButtonRef.current?.contains(target) &&
        !mobileMenuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!collectionsOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCollectionsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [collectionsOpen]);

  const handleLogout = async () => {
    await logoutAction();
    setAccountOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-sm border-b border-ink/10">
        <div className="flex items-center justify-between px-6 md:px-10 py-4">
          <Link
            href="/"
            aria-label="Emmanuel Uche Global home"
            className="shrink-0"
          >
            <Image
              src="/images/logo.png"
              alt="Emmanuel Uche Global"
              width={640}
              height={480}
              priority
              className="h-12 w-[58px] object-contain md:h-14 md:w-[68px]"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <button
              type="button"
              aria-controls="collection-navigation"
              aria-expanded={collectionsOpen}
              onClick={() => setCollectionsOpen(true)}
              className="group text-[12px] tracking-[0.14em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              <span className="underline-draw">Collections</span>
            </button>
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group text-[12px] tracking-[0.14em] uppercase text-ink-soft hover:text-ink transition-colors"
              >
                <span className="underline-draw">{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-ink-soft">
              <svg
                className="w-3.5 h-3.5 text-clay"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              Aba, NG
            </span>

            <button
              onClick={() => setAccountOpen(true)}
              aria-label="Open account"
              className="text-ink-soft hover:text-ink transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
              </svg>
            </button>

            <button
              onClick={openCart}
              className="text-[12px] tracking-[0.12em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              Bag {itemCount > 0 && `(${itemCount})`}
            </button>

            <button
              type="button"
              aria-controls="collection-navigation"
              aria-expanded={collectionsOpen}
              onClick={() => {
                setOpen(false);
                setCollectionsOpen(true);
              }}
              className="md:hidden text-[10px] tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              Collections
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="relative flex h-8 w-8 items-center justify-center md:hidden"
              onClick={() => {
                setCollectionsOpen(false);
                setOpen(!open);
              }}
            >
              <span
                className={`absolute h-px w-5 bg-ink transition-transform duration-300 ease-out ${
                  open ? "rotate-45" : "-translate-y-[3px]"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-ink transition-transform duration-300 ease-out ${
                  open ? "-rotate-45" : "translate-y-[3px]"
                }`}
              />
            </button>
          </div>
        </div>

        {open && (
          <nav
            ref={mobileMenuRef}
            id="mobile-navigation"
            className="md:hidden flex flex-col border-t border-ink/10 bg-ivory"
          >
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-6 py-4 text-sm tracking-wide uppercase border-b border-ink/5"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {collectionsOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <button
            type="button"
            aria-label="Close collections menu"
            onClick={() => setCollectionsOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <aside
            id="collection-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Collections"
            className="relative z-10 flex h-full w-[min(440px,88vw)] flex-col bg-ivory shadow-xl"
          >
            <div className="flex justify-end px-6 py-5">
              <button
                type="button"
                aria-label="Close collections menu"
                onClick={() => setCollectionsOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Collections" className="flex flex-col overflow-y-auto px-6 pb-8">
              {collections
                .filter((collection) => collection.status === "available")
                .map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    onClick={() => setCollectionsOpen(false)}
                    className="py-3 text-sm tracking-wide uppercase text-ink hover:text-clay"
                  >
                    {collection.name}
                  </Link>
                ))}
            </nav>
          </aside>
        </div>
      )}

      <AccountDrawer
        open={accountOpen}
        session={session}
        onClose={() => setAccountOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
