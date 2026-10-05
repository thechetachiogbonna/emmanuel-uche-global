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
    <section className="auth-panel">
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-description">
        Sign in to follow your made-to-order pieces and be first to know when a
        new collection releases.
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-input-group">
          <span>Email*</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </label>

        <label className="auth-input-group">
          <span>Password*</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="auth-submit"
        >
          {submitting ? "Signing In…" : "Sign In"}
        </button>
      </form>

      <div className="auth-alternate">
        <p>New here?</p>
        <Link href="/signup" className="auth-alternate-link">
          Create an Account
        </Link>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-panel" aria-hidden="true" />}>
      <LoginForm />
    </Suspense>
  );
}
