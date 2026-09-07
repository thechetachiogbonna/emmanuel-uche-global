"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { loginAction } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await loginAction(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm bg-white py-10 px-8 rounded-lg shadow-lg">
      <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-4 text-center">
        Emmanuel Uche Global
      </p>
      <h1 className="font-display font-light italic text-4xl text-center mb-3">
        Welcome back
      </h1>
      <p className="text-[14px] text-ink-soft text-center mb-10 leading-relaxed">
        Sign in to follow your made-to-order pieces and be first to know
        when a new collection releases.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-[13px] text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing In…" : "Sign In"}
        </button>
      </form>

      <p className="text-[13px] text-ink-soft text-center mt-8">
        New here?{" "}
        <Link href="/signup" className="text-clay hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="px-6 md:px-10 py-16 md:py-24 flex justify-center">
      <Suspense fallback={<div className="w-full max-w-sm py-10 px-8" />}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
