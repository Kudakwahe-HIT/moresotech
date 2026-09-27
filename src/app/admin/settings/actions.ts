"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";
import { assertRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { fieldErrorsFrom, type FormState } from "@/lib/validation/learning";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validation/settings";

export async function saveSiteSettings(_prev: FormState<SiteSettingsValues>, formData: FormData): Promise<FormState<SiteSettingsValues>> {
  const admin = await assertRole("admin");
  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);

  const previous = await getSiteSettings();
  const values = { ...parsed.data, updatedBy: admin.id, updatedAt: new Date() };
  await db.insert(siteSettings).values({ id: 1, ...values }).onConflictDoUpdate({ target: siteSettings.id, set: values });

  // A replaced or removed hero picture is no longer used anywhere.
  if (previous.heroImage && previous.heroImage !== parsed.data.heroImage) {
    try {
      await del(previous.heroImage);
    } catch (error) {
      console.error("Couldn't delete old hero picture", error);
    }
  }

  // Contact details and the announcement show across the site.
  revalidatePath("/", "layout");
  return { status: "idle", message: "saved" };
}
