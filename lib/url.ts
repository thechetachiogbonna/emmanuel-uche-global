import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort absolute base URL for building callback/webhook URLs from
 * inside a Server Action. Prefers an explicit env override (needed behind
 * some proxies/CDNs where headers can't be trusted), falls back to the
 * incoming request's own Host header.
 */
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";
  return `${proto}://${host}`;
}
