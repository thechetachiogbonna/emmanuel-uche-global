"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "@/lib/customer/useCustomerAuth";

const SESSION_FLAG = "uche_signup_prompt_shown";
const SKIP_PATHS = ["/login", "/signup"];

export default function SignupPrompt() {
  const pathname = usePathname();
  const { session, hydrated } = useCustomerAuth();
  const [visible, setVisible] = useState(false);
  const thresholdRef = useRef<number | null>(null);
  const shownRef = useRef(false);

  const skip = SKIP_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (skip || !hydrated || session) return;

    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      // sessionStorage unavailable — treat as not shown, worst case it
      // reappears on a later visit
    }
    if (alreadyShown) return;

    // Random point somewhere between 25% and 60% down the page —
    // different each visit, not a fixed trigger line.
    if (thresholdRef.current === null) {
      thresholdRef.current = 0.25 + Math.random() * 0.35;
    }

    const handleScroll = () => {
      if (shownRef.current) return;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = window.scrollY / scrollable;
      if (progress >= (thresholdRef.current ?? 1)) {
        shownRef.current = true;
        setVisible(true);
        try {
          window.sessionStorage.setItem(SESSION_FLAG, "1");
        } catch {
          // ignore — non-fatal if it can't persist
        }
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hydrated, session]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-ivory border border-ink/10 p-8"
      >
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute top-4 right-4 text-ink-soft hover:text-ink text-lg leading-none"
        >
          ✕
        </button>

        <p className="text-[11px] tracking-[0.18em] uppercase text-clay mb-3">
          Uche Fashion International
        </p>
        <h2 className="font-display font-light italic text-3xl mb-3 leading-tight">
          Don&apos;t miss the next drop
        </h2>
        <p className="text-[14px] text-ink-soft leading-relaxed mb-7">
          Create a free account for early access to new collections and
          updates on your made-to-order pieces as they&apos;re finished —
          takes less than a minute.
        </p>

        <div className="grid gap-3">
          <Link
            href="/signup"
            onClick={() => setVisible(false)}
            className="text-center bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            onClick={() => setVisible(false)}
            className="text-center border border-ink/20 text-[12px] tracking-[0.14em] uppercase py-3.5 hover:border-ink transition-colors"
          >
            Log In
          </Link>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="w-full text-center text-[12px] text-ink-soft hover:text-ink mt-5 tracking-wide"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
