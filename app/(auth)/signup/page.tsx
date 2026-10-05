"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { signupAction } from "@/lib/actions/auth";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
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
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <section className="auth-panel auth-panel-signup">
      <h1 className="auth-title">Create an Account</h1>
      <p className="auth-description">
        Access exclusives and more. Join for early access to new collections and
        updates on your made-to-order pieces.
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-input-group">
          <span>Full Name*</span>
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />
        </label>

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
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </label>

        <label className="auth-input-group">
          <span>Confirm Password*</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
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
          {submitting ? "Creating Account…" : "Create Account"}
        </button>
      </form>

      <div className="auth-alternate">
        <p>Already have an account?</p>
        <Link href="/login" className="auth-alternate-link">
          Sign In
        </Link>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-panel" aria-hidden="true" />}>
      <SignupForm />
    </Suspense>
  );
}
