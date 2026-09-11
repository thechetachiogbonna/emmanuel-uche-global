"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

type AuthResult = { ok: true } | { ok: false; error: string };

export async function signupAction(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Incorrect email or password." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() });
  revalidatePath("/", "layout");
}
