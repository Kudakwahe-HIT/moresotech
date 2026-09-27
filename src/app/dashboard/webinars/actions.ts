"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments, webinarRegistrations } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { assertRole } from "@/lib/auth";
import { webinarWindow } from "@/lib/learning-rules";
import { getWebinarById } from "@/lib/webinars";

export async function setWebinarRegistration(webinarId: string, register: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student", "instructor", "admin");
    const webinar = await getWebinarById(webinarId);
    if (!webinar || webinar.cancelled) throw new UserFacingError("This session isn't available.");

    if (register) {
      if (webinarWindow(webinar.startsAt, webinar.durationMinutes).past) throw new UserFacingError("This session has already ended.");
      if (webinar.access === "enrolled") {
        const [enrolled] = webinar.courseId
          ? await db
              .select({ id: enrollments.id })
              .from(enrollments)
              .where(and(eq(enrollments.courseId, webinar.courseId), eq(enrollments.profileId, profile.id), inArray(enrollments.status, ["active", "completed"])))
              .limit(1)
          : [];
        if (!enrolled) throw new UserFacingError("This session is for students enrolled in its course.");
      }
      await db.insert(webinarRegistrations).values({ webinarId, profileId: profile.id }).onConflictDoNothing();
    } else {
      await db
        .delete(webinarRegistrations)
        .where(and(eq(webinarRegistrations.webinarId, webinarId), eq(webinarRegistrations.profileId, profile.id)));
    }
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin/webinars");
  });
}

