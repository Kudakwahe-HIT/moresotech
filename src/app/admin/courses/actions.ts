"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq, gt, lt, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificates, courses, enrollments, lessons, profiles } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { isUuid } from "@/lib/applications";
import { assertRole } from "@/lib/auth";
import {
  courseFormSchema,
  fieldErrorsFrom,
  lessonFormSchema,
  type CourseFormValues,
  type FormState,
  type LessonFormValues,
} from "@/lib/validation/learning";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

async function uniqueCourseSlug(title: string, ignoreId?: string) {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .slice(0, 80) || "course";
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const [taken] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1);
    if (!taken || taken.id === ignoreId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function toCourseRow(data: CourseFormValues) {
  const { price, ...rest } = data;
  return { ...rest, priceCents: price };
}

export async function createCourse(_prev: FormState<CourseFormValues>, formData: FormData): Promise<FormState<CourseFormValues>> {
  await assertRole("admin");
  const parsed = courseFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);
  const [row] = await db
    .insert(courses)
    .values({ ...toCourseRow(parsed.data), slug: await uniqueCourseSlug(parsed.data.title) })
    .returning({ id: courses.id });
  refresh();
  redirect(`/admin/courses/${row.id}?saved=1`);
}

export async function updateCourse(id: string, _prev: FormState<CourseFormValues>, formData: FormData): Promise<FormState<CourseFormValues>> {
  await assertRole("admin");
  const parsed = courseFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);
  await db
    .update(courses)
    .set({ ...toCourseRow(parsed.data), slug: await uniqueCourseSlug(parsed.data.title, id), updatedAt: new Date() })
    .where(eq(courses.id, id));
  refresh();
  redirect(`/admin/courses/${id}?saved=1`);
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    const [issued] = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.courseId, id)).limit(1);
    if (issued) throw new UserFacingError("Certificates have been issued for this course. Archive it instead of deleting it.");
    await db.delete(courses).where(eq(courses.id, id));
    refresh();
  });
}

// ─── Lessons ───────────────────────────────────────────────────────────────

export async function saveLesson(
  courseId: string,
  lessonId: string | null,
  _prev: FormState<LessonFormValues>,
  formData: FormData,
): Promise<FormState<LessonFormValues>> {
  await assertRole("admin");
  if (!isUuid(courseId)) return { status: "error", message: "Course not found." };
  const parsed = lessonFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);

  if (lessonId) {
    await db.update(lessons).set(parsed.data).where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)));
  } else {
    const [last] = await db
      .select({ position: lessons.position })
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(desc(lessons.position))
      .limit(1);
    await db.insert(lessons).values({ ...parsed.data, courseId, position: (last?.position ?? 0) + 1 });
  }
  await db.update(courses).set({ updatedAt: new Date() }).where(eq(courses.id, courseId));
  refresh();
  return { status: "idle" };
}

export async function moveLesson(lessonId: string, direction: "up" | "down"): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (!lesson) throw new UserFacingError("Lesson not found");
    const [neighbour] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.courseId, lesson.courseId),
          direction === "up" ? lt(lessons.position, lesson.position) : gt(lessons.position, lesson.position),
        ),
      )
      .orderBy(direction === "up" ? desc(lessons.position) : asc(lessons.position))
      .limit(1);
    if (!neighbour) return;
    await db.update(lessons).set({ position: neighbour.position }).where(eq(lessons.id, lesson.id));
    await db.update(lessons).set({ position: lesson.position }).where(eq(lessons.id, neighbour.id));
    refresh();
  });
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    refresh();
  });
}

// ─── Enrollments ───────────────────────────────────────────────────────────

/** Confirm payment (activate) or cancel a learner's enrollment. */
export async function setEnrollmentStatus(enrollmentId: string, status: "active" | "cancelled"): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await assertRole("admin");
    if (!isUuid(enrollmentId)) throw new UserFacingError("Enrollment not found");
    await db
      .update(enrollments)
      .set(status === "active" ? { status, activatedBy: admin.id, activatedAt: new Date() } : { status })
      .where(eq(enrollments.id, enrollmentId));
    refresh();
  });
}

/** Give a student access directly (e.g. paid in person, scholarship, staff). */
export async function enrollByEmail(courseId: string, email: string): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await assertRole("admin");
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) throw new UserFacingError("Enter the student's email address.");
    const [student] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${clean}`)
      .limit(1);
    if (!student) throw new UserFacingError("No account uses that email. Ask the student to sign up first.");
    await db
      .insert(enrollments)
      .values({ courseId, profileId: student.id, status: "active", activatedBy: admin.id, activatedAt: new Date() })
      .onConflictDoUpdate({
        target: [enrollments.courseId, enrollments.profileId],
        set: { status: "active", activatedBy: admin.id, activatedAt: new Date() },
      });
    refresh();
  });
}
