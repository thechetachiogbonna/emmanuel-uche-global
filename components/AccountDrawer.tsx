"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Session = { name: string; email: string } | null;

type AccountDrawerProps = {
  open: boolean;
  session: Session;
  onClose: () => void;
  onLogout: () => void;
};

export default function AccountDrawer({
  open,
  session,
  onClose,
  onLogout,
}: AccountDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[1000] w-full max-w-[360px] sm:max-w-[380px] h-screen bg-[#FAF9F6] px-7 py-7 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-start text-black font-sans ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#FAF9F6" }}
        role="dialog"
        aria-modal="true"
        aria-label="Account"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-normal tracking-normal text-black font-sans">
            {session ? session.name : "Account"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close account"
            className="-mr-1 -mt-1 p-1 text-black transition-opacity hover:opacity-60"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        {session ? (
          <div className="mt-7 flex flex-col items-start font-sans">
            <Link
              href="/account"
              onClick={onClose}
              className="border-b border-black pb-0.5 text-[13.5px] font-normal text-black hover:opacity-70 transition-opacity inline-block"
            >
              Account
            </Link>
            <button
              onClick={onLogout}
              className="mt-6 w-full bg-black py-3 text-[13px] font-normal text-white text-center transition-colors hover:bg-neutral-800"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="mt-7 flex flex-col items-start font-sans">
            <Link
              href="/login"
              onClick={onClose}
              className="border-b border-black pb-0.5 text-[13.5px] font-normal text-black hover:opacity-70 transition-opacity inline-block"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="mt-4.5 border-b border-black pb-0.5 text-[13.5px] font-normal text-black hover:opacity-70 transition-opacity inline-block"
            >
              Sign Up
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}