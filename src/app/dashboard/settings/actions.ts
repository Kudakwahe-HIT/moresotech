"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applicationDocuments, applications, payments, profiles, userSettings } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { assertRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { NOTIFICATION_GROUP_KEYS } from "@/lib/settings-rules";
import { fieldErrorsFrom, type FormState } from "@/lib/validation/learning";
import { studyGoalsSchema, type StudyGoalsValues } from "@/lib/validation/settings";

export async function saveStudyGoals(_prev: FormState<StudyGoalsValues>, formData: FormData): Promise<FormState<StudyGoalsValues>> {
  const profile = await assertRole("student");
  const parsed = studyGoalsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);
  const values = { ...parsed.data, updatedAt: new Date() };
  await db.insert(userSettings).values({ profileId: profile.id, ...values }).onConflictDoUpdate({ target: userSettings.profileId, set: values });
  revalidatePath("/dashboard/settings");
  return { status: "idle", message: "saved" };
}

/** Saved as soon as a switch is flipped. */
export async function saveNotificationPrefs(muted: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    const clean = NOTIFICATION_GROUP_KEYS.filter((g) => muted.includes(g));
    const values = { mutedNotifications: clean, updatedAt: new Date() };
    await db.insert(userSettings).values({ profileId: profile.id, ...values }).onConflictDoUpdate({ target: userSettings.profileId, set: values });
    revalidatePath("/dashboard", "layout");
  });
}

/**
 * Permanently deletes a student's account: applications, uploaded files, courses progress,
 * certificates and the sign-in itself. Accounts with payment history are kept, because payment
 * records must be retained; those students are pointed to support instead.
 */
export async function deleteMyAccount(confirmation: string): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    if (confirmation.trim().toUpperCase() !== "DELETE") throw new UserFacingError("Type DELETE to confirm.");

    const [paid] = await db.select({ id: payments.id }).from(payments).where(eq(payments.profileId, profile.id)).limit(1);
    if (paid) {
      const { supportEmail } = await getSiteSettings();
      throw new UserFacingError(
        `Your account has payment records, which we're required to keep, so it can't be deleted here. ${supportEmail ? `Email ${supportEmail}` : "Contact our team"} and we'll close it for you.`,
      );
    }

    const files = await db
      .select({ pathname: applicationDocuments.blobPathname })
      .from(applicationDocuments)
      .innerJoin(applications, eq(applications.id, applicationDocuments.applicationId))
      .where(eq(applications.profileId, profile.id));

    // Everything else hangs off the profile and is removed with it.
    await db.delete(profiles).where(eq(profiles.id, profile.id));
    if (files.length) {
      try {
        await del(files.map((f) => f.pathname));
      } catch (error) {
        console.error("Couldn't delete some uploaded files", error);
      }
    }
    await (await clerkClient()).users.deleteUser(profile.id);
  });
}
