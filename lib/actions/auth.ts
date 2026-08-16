"use server";

import { revalidatePath } from "next/cache";
import {
  login,
  logout,
  signup,
} from "@/lib/auth";

export async function signupAction(name: string, email: string, password: string) {
  const result = await signup(name, email, password);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function loginAction(email: string, password: string) {
  const result = await login(email, password);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
}
