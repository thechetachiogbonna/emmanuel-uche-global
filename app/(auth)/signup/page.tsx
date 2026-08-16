"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signupAction } from "@/lib/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const result = await signupAction(name, email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <section className="px-6 md:px-10 py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-sm bg-white py-10 px-8 rounded-lg shadow-lg">
        <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-4 text-center">
          Uche Fashion International
        </p>
        <h1 className="font-display font-light italic text-4xl text-center mb-3">
          Create an account
        </h1>
        <p className="text-[14px] text-ink-soft text-center mb-10 leading-relaxed">
          Join for early access to new collections and updates on your
          made-to-order pieces as they&apos;re finished.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
              placeholder="Your name"
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
              placeholder="Re-enter your password"
            />
          </div>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3.5 hover:bg-clay transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className="text-[13px] text-ink-soft text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-clay hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
