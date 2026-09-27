"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, type Role } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { assertRole } from "@/lib/auth";

/** Change someone's role. Admins can't demote themselves, so there's always at least one admin. */
export async function setUserRole(profileId: string, role: Role): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await assertRole("admin");
    if (!["student", "instructor", "admin"].includes(role)) throw new UserFacingError("Unknown role");
    if (profileId === admin.id && role !== "admin") throw new UserFacingError("You can't remove your own admin access.");
    const [target] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, profileId)).limit(1);
    if (!target) throw new UserFacingError("User not found");
    if (target.role === "admin" && role !== "admin") {
      const [admins] = await db.select({ n: count() }).from(profiles).where(eq(profiles.role, "admin"));
      if (admins.n <= 1) throw new UserFacingError("There must always be at least one admin.");
    }
    await db.update(profiles).set({ role, updatedAt: new Date() }).where(eq(profiles.id, profileId));
    revalidatePath("/admin", "layout");
  });
}
