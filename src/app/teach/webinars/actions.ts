"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, webinars } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { isUuid } from "@/lib/applications";
import { assertRole } from "@/lib/auth";
import { fieldErrorsFrom, webinarFormSchema, type FormState, type WebinarFormValues } from "@/lib/validation/learning";

function refresh() {
  revalidatePath("/teach", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

/** True when the signed-in instructor teaches this course (admins may use any course). */
async function teachesCourse(profile: { id: string; role: string }, courseId: string | null) {
  if (!courseId || !isUuid(courseId)) return false;
  const [course] = await db.select({ instructorId: courses.instructorId }).from(courses).where(eq(courses.id, courseId)).limit(1);
  return Boolean(course) && (profile.role === "admin" || course.instructorId === profile.id);
}

/** Instructors manage only sessions linked to a course they teach. */
async function assertSessionOwner(webinarId: string) {
  const profile = await assertRole("instructor", "admin");
  if (!isUuid(webinarId)) throw new UserFacingError("Session not found");
  const [row] = await db.select({ courseId: webinars.courseId }).from(webinars).where(eq(webinars.id, webinarId)).limit(1);
  if (!row || !(await teachesCourse(profile, row.courseId))) throw new UserFacingError("Session not found");
  return profile;
}

/**
 * Validates the form and checks the course. Unlike admin sessions, an instructor's session always
 * stays linked to their course, even when it's open to everyone (e.g. a free taster class).
 */
async function parseSession(profile: { id: string; role: string }, formData: FormData) {
  const parsed = webinarFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: fieldErrorsFrom<WebinarFormValues>(parsed.error.issues) };
  if (!(await teachesCourse(profile, parsed.data.courseId))) {
    return { error: { status: "error", message: "Please fix the highlighted fields.", fieldErrors: { courseId: "Choose one of the courses you teach." } } as FormState<WebinarFormValues> };
  }
  return { data: parsed.data };
}

export async function createTeachWebinar(_prev: FormState<WebinarFormValues>, formData: FormData): Promise<FormState<WebinarFormValues>> {
  const profile = await assertRole("instructor", "admin");
  const result = await parseSession(profile, formData);
  if (result.error) return result.error;
  await db.insert(webinars).values({ ...result.data, createdBy: profile.id });
  refresh();
  redirect("/teach/webinars?saved=1");
}

export async function updateTeachWebinar(id: string, _prev: FormState<WebinarFormValues>, formData: FormData): Promise<FormState<WebinarFormValues>> {
  const profile = await assertSessionOwner(id);
  const result = await parseSession(profile, formData);
  if (result.error) return result.error;
  await db.update(webinars).set({ ...result.data, updatedAt: new Date() }).where(eq(webinars.id, id));
  refresh();
  redirect("/teach/webinars?saved=1");
}

export async function setTeachWebinarCancelled(id: string, cancelled: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await assertSessionOwner(id);
    await db.update(webinars).set({ cancelled, updatedAt: new Date() }).where(eq(webinars.id, id));
    refresh();
  });
}

export async function deleteTeachWebinar(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertSessionOwner(id);
    await db.delete(webinars).where(eq(webinars.id, id));
    refresh();
  });
}
