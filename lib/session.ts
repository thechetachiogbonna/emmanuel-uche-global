import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";

export type SubjectType = "customer" | "admin";

const COOKIE_NAME = "session";
const TTL_MS: Record<SubjectType, number> = {
  customer: 1000 * 60 * 60 * 24 * 30, // 30 days
  admin: 1000 * 60 * 60 * 12, // 12 hours — shorter, it's an admin console
};

export async function createSession(email: string, subjectId: string) {
  const token = randomBytes(32).toString("hex");

  const type: SubjectType = email === process.env.ADMIN_EMAIL ? "admin" : "customer";
  const expiresAt = new Date(Date.now() + TTL_MS[type]);

  await db.insert(sessions).values({
    id: token,
    subjectType: type,
    subjectId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionSubjectTypeAndId(): Promise<{ type: string; id: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const row = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.id, token),
      gt(sessions.expiresAt, new Date())
    ),
  });

  return row ? { type: row.subjectType, id: row.subjectId } : null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookieStore.delete(COOKIE_NAME);
}
