"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { useCart } from "@/lib/cart/CartContext";
import { useCartDrawer } from "@/lib/cart/CartDrawerContext";
import AccountDrawer from "@/components/AccountDrawer";

const links = [
  { label: "Shop", href: "/#shop" },
  { label: "Story", href: "/#story" },
  { label: "Made-to-Order", href: "/#made-to-order" },
];

type Session = { name: string; email: string } | null;

export default function Nav({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();
  const { itemCount } = useCart();
  const { openCart } = useCartDrawer();

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
            className="font-display italic text-2xl md:text-3xl tracking-tight"
          >
            Emmanuel Uche
          </Link>

          <nav className="hidden md:flex items-center gap-10">
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
              aria-label="Menu"
              className="md:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setOpen(!open)}
            >
              <span className="block w-5 h-px bg-ink" />
              <span className="block w-5 h-px bg-ink" />
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden flex flex-col border-t border-ink/10 bg-ivory">
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
            <button
              onClick={() => {
                setOpen(false);
                openCart();
              }}
              className="text-left px-6 py-4 text-sm tracking-wide uppercase border-b border-ink/5"
            >
              Bag {itemCount > 0 && `(${itemCount})`}
            </button>
          </nav>
        )}
      </header>

      <AccountDrawer
        open={accountOpen}
        session={session}
        onClose={() => setAccountOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
