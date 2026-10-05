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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

        <div className="auth-input-group">
          <label htmlFor="signup-password">Password*</label>
          <div className="auth-password-control">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
        </div>

        <div className="auth-input-group">
          <label htmlFor="signup-confirm-password">Confirm Password*</label>
          <div className="auth-password-control">
            <input
              id="signup-confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              aria-pressed={showConfirm}
              onClick={() => setShowConfirm((visible) => !visible)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {showConfirm && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
        </div>

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
