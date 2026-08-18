"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { storeSettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";

export type SettingsDraft = {
  storeName: string;
  studioLocation: string;
  supportEmail: string;
  supportPhone: string;
  hours: string;
};

export async function updateSettingsAction(draft: SettingsDraft) {
  await requireAdmin();

  const existing = await db.select().from(storeSettings).limit(1);

  if (existing[0]) {
    await db
      .update(storeSettings)
      .set({ ...draft, updatedAt: new Date() })
      .where(eq(storeSettings.id, existing[0].id));
  } else {
    await db.insert(storeSettings).values({ id: "default", ...draft });
  }

  revalidatePath("/admin/settings");
  return { ok: true as const };
}
