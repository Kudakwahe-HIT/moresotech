"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { certificates, courses, enrollments, lessonProgress, lessons } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { isUuid } from "@/lib/applications";
import { assertRole } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/learning-rules";

/** Free course: instant access. Paid course: a request our team confirms after payment. */
export async function enrollInCourse(courseId: string): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    if (!isUuid(courseId)) throw new UserFacingError("Course not found");
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
      .limit(1);
    if (!course) throw new UserFacingError("This course isn't available.");

    const free = course.priceCents === 0;
    const [existing] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.profileId, profile.id)))
      .limit(1);
    if (existing && existing.status !== "cancelled") return;

    const values = { status: free ? ("active" as const) : ("pending_payment" as const), activatedAt: free ? new Date() : null };
    if (existing) {
      await db.update(enrollments).set(values).where(eq(enrollments.id, existing.id));
    } else {
      await db.insert(enrollments).values({ courseId, profileId: profile.id, ...values });
    }
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin", "layout");
  });
}

/**
 * Marks a lesson done. When it's the last one, completes the enrollment and issues the
 * certificate (once). Returns the certificate code when one was just issued.
 */
export async function completeLesson(lessonId: string): Promise<ActionResult & { certificateCode?: string }> {
  let certificateCode: string | undefined;
  const result = await runAction(async () => {
    const profile = await assertRole("student");
    if (!isUuid(lessonId)) throw new UserFacingError("Lesson not found");
    const [row] = await db
      .select({ lesson: lessons, course: courses, enrollment: enrollments })
      .from(lessons)
      .innerJoin(courses, eq(courses.id, lessons.courseId))
      .leftJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.profileId, profile.id)))
      .where(eq(lessons.id, lessonId))
      .limit(1);
    if (!row || row.course.status !== "published") throw new UserFacingError("Lesson not found");
    if (!hasCourseAccess(row.enrollment?.status)) throw new UserFacingError("Enroll in the course to track your progress.");

    await db.insert(lessonProgress).values({ profileId: profile.id, lessonId }).onConflictDoNothing();

    const [[total], [done]] = await Promise.all([
      db.select({ n: count() }).from(lessons).where(eq(lessons.courseId, row.course.id)),
      db
        .select({ n: count() })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(and(eq(lessons.courseId, row.course.id), eq(lessonProgress.profileId, profile.id))),
    ]);

    if (done.n >= total.n && row.enrollment && row.enrollment.status !== "completed") {
      await db.update(enrollments).set({ status: "completed", completedAt: new Date() }).where(eq(enrollments.id, row.enrollment.id));
      if (row.course.awardsCertificate) {
        const user = await currentUser();
        const code = `MST-${randomBytes(4).toString("hex").toUpperCase()}`;
        const inserted = await db
          .insert(certificates)
          .values({
            code,
            profileId: profile.id,
            courseId: row.course.id,
            recipientName: user?.fullName || profile.email,
            certificateName: row.course.certificateName || `${row.course.title} Certificate`,
          })
          .onConflictDoNothing()
          .returning({ code: certificates.code });
        certificateCode = inserted[0]?.code;
      }
    }
    revalidatePath("/dashboard", "layout");
  });
  return { ...result, certificateCode };
}
