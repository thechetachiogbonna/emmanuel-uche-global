import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, destroySession, getSessionSubjectTypeAndId } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CustomerResult = { ok: true } | { ok: false; error: string };

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<CustomerResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Enter your name." };
  if (!EMAIL_RE.test(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const prefix = normalizedEmail === process.env.ADMIN_EMAIL ? "admin" : "cust";
  const id = `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  await db.insert(users).values({
    id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  await createSession(normalizedEmail, id);
  return { ok: true };
}

export async function login(
  email: string,
  password: string
): Promise<CustomerResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    return { ok: false, error: "Incorrect email or password." };
  }

  await createSession(normalizedEmail, account.id);
  return { ok: true };
}

export async function logout() {
  await destroySession();
}

export async function getCurrentUser() {
  const sessionSubjectTypeAndId = await getSessionSubjectTypeAndId();
  if (!sessionSubjectTypeAndId) return null;

  const account = await db.query.users.findFirst({
    where: eq(users.id, sessionSubjectTypeAndId.id),
    columns: { id: true, name: true, email: true },
  });
  return account ?? null;
}
