"use client";

import { useLocalStore } from "@/lib/useLocalStore";
import { mockHash } from "./hash";
import type { CustomerAccount, CustomerSession } from "./types";

/**
 * ⚠️ NOT REAL AUTHENTICATION — see hash.ts for why. This stores accounts
 * and sessions in localStorage entirely client-side, which means anyone
 * with devtools can read or forge them. It's here so the login/signup UI
 * has something real to talk to during development. Before launch, swap
 * this for real auth (NextAuth.js, Clerk, Auth.js) backed by a server
 * that owns password hashing and session issuance.
 */

const ACCOUNTS_KEY = "uche_customer_accounts";
const SESSION_KEY = "uche_customer_session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Result = { ok: true } | { ok: false; error: string };

export function useCustomerAuth() {
  const {
    value: accounts,
    setValue: setAccounts,
    hydrated: accountsHydrated,
  } = useLocalStore<CustomerAccount[]>(ACCOUNTS_KEY, []);
  const {
    value: session,
    setValue: setSession,
    hydrated: sessionHydrated,
  } = useLocalStore<CustomerSession>(SESSION_KEY, null);

  const signup = (name: string, email: string, password: string): Result => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim()) return { ok: false, error: "Enter your name." };
    if (!EMAIL_RE.test(normalizedEmail)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    if (accounts.some((a) => a.email === normalizedEmail)) {
      return {
        ok: false,
        error: "An account with this email already exists.",
      };
    }

    const account: CustomerAccount = {
      id: `cust_${Date.now().toString(36)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: mockHash(password),
      joined: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, account]);
    setSession({ email: account.email, name: account.name });
    return { ok: true };
  };

  const login = (email: string, password: string): Result => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email === normalizedEmail);
    if (!account || account.passwordHash !== mockHash(password)) {
      return { ok: false, error: "Incorrect email or password." };
    }
    setSession({ email: account.email, name: account.name });
    return { ok: true };
  };

  const logout = () => setSession(null);

  return {
    session,
    hydrated: accountsHydrated && sessionHydrated,
    signup,
    login,
    logout,
  };
}
