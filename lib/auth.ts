import "server-only";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days, matches the old customer session TTL
  },
  plugins: [
    admin({ defaultRole: "user" }),
    // Must be last — handles cookie writes correctly from Server Actions.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

/**
 * Preserves the same shape/signature the rest of the app already relies
 * on (14 call sites), so migrating the auth backend didn't require
 * touching every page that reads the current user.
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/**
 * Every admin Server Action calls this first. proxy.ts already blocks
 * non-admin requests to /admin/* at the network level, but Server Actions
 * are still technically independent endpoints — this is the
 * defense-in-depth check inside the action itself.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized — admin session required.");
  }
  return user;
}
