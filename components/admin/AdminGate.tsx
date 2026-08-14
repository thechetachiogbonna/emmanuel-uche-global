"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * ⚠️ NOT REAL AUTHENTICATION.
 *
 * This is a client-side-only gate meant purely so the admin UI isn't wide
 * open during development/preview. The "password" check runs in the
 * browser and the flag lives in sessionStorage — anyone who opens
 * devtools can bypass it in seconds.
 *
 * Before this goes anywhere near production, replace this with real auth
 * (NextAuth.js, Clerk, Auth.js + your provider, etc.) gating the /admin
 * route on the server, plus a real backend authorizing every read/write.
 */
const DEV_PASSWORD = "uche-admin";
const SESSION_KEY = "uche_admin_authed";

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const flag = window.sessionStorage.getItem(SESSION_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount, not a cascading update
    setAuthed(flag === "1");
    setChecked(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === DEV_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!checked) {
    return <div className="min-h-screen bg-ivory" />;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm border border-ink/10 bg-white p-8"
        >
          <div className="font-display italic text-3xl mb-1">Uche</div>
          <p className="text-[12px] tracking-[0.14em] uppercase text-ink-soft mb-6">
            Admin Console
          </p>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Password
          </label>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm mb-1 outline-none focus:border-clay transition-colors"
            placeholder="Enter admin password"
          />
          {error && (
            <p className="text-[12px] text-red-700 mt-1 mb-2">
              Incorrect password.
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-4 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3 hover:bg-clay transition-colors"
          >
            Enter Console
          </button>
          <p className="text-[11px] text-ink-soft mt-5 leading-relaxed">
            Dev preview only — this is not secure. Replace with real
            authentication before deploying.
          </p>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
