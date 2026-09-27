"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { savedScholarships, scholarships } from "@/db/schema";
import { assertRole } from "@/lib/auth";

/** Saves or un-saves a published scholarship for the signed-in user. */
export async function toggleSavedScholarship(scholarshipId: string, save: boolean) {
  const profile = await assertRole("student");

  if (save) {
    const [exists] = await db
      .select({ id: scholarships.id })
      .from(scholarships)
      .where(and(eq(scholarships.id, scholarshipId), eq(scholarships.status, "published")))
      .limit(1);
    if (!exists) throw new Error("Scholarship not found");
    await db.insert(savedScholarships).values({ profileId: profile.id, scholarshipId }).onConflictDoNothing();
  } else {
    await db
      .delete(savedScholarships)
      .where(and(eq(savedScholarships.profileId, profile.id), eq(savedScholarships.scholarshipId, scholarshipId)));
  }
  revalidatePath("/dashboard", "layout");
}
