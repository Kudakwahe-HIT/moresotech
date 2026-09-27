"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webinars } from "@/db/schema";
import { runAction, type ActionResult } from "@/lib/action-result";
import { assertRole } from "@/lib/auth";
import { fieldErrorsFrom, webinarFormSchema, type FormState, type WebinarFormValues } from "@/lib/validation/learning";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

function toRow(data: WebinarFormValues) {
  return { ...data, courseId: data.access === "enrolled" ? data.courseId : null };
}

export async function createWebinar(_prev: FormState<WebinarFormValues>, formData: FormData): Promise<FormState<WebinarFormValues>> {
  const admin = await assertRole("admin");
  const parsed = webinarFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);
  await db.insert(webinars).values({ ...toRow(parsed.data), createdBy: admin.id });
  refresh();
  redirect("/admin/webinars?saved=1");
}

export async function updateWebinar(id: string, _prev: FormState<WebinarFormValues>, formData: FormData): Promise<FormState<WebinarFormValues>> {
  await assertRole("admin");
  const parsed = webinarFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorsFrom(parsed.error.issues);
  await db.update(webinars).set({ ...toRow(parsed.data), updatedAt: new Date() }).where(eq(webinars.id, id));
  refresh();
  redirect("/admin/webinars?saved=1");
}

export async function setWebinarCancelled(id: string, cancelled: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    await db.update(webinars).set({ cancelled, updatedAt: new Date() }).where(eq(webinars.id, id));
    refresh();
  });
}

export async function deleteWebinar(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    await db.delete(webinars).where(eq(webinars.id, id));
    refresh();
  });
}
