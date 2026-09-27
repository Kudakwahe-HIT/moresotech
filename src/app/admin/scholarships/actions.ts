"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, scholarships, type ScholarshipStatus } from "@/db/schema";
import { assertRole } from "@/lib/auth";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/scholarships";
import {
  scholarshipFormSchema,
  type ScholarshipFormState,
  type ScholarshipFormValues,
} from "@/lib/validation/scholarship";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

function parse(formData: FormData) {
  const result = scholarshipFormSchema.safeParse(Object.fromEntries(formData));
  if (result.success) return { data: result.data };
  const fieldErrors: ScholarshipFormState["fieldErrors"] = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ScholarshipFormValues;
    fieldErrors[key] ??= issue.message;
  }
  return { error: { status: "error", message: "Please fix the highlighted fields.", fieldErrors } as ScholarshipFormState };
}

export async function createScholarship(_prev: ScholarshipFormState, formData: FormData): Promise<ScholarshipFormState> {
  const admin = await assertRole("admin");
  const { data, error } = parse(formData);
  if (error) return error;

  const slug = await uniqueSlug(data.title);
  await db.insert(scholarships).values({ ...data, slug, createdBy: admin.id });
  refresh();
  redirect(`/admin/scholarships?saved=${encodeURIComponent(data.title)}`);
}

export async function updateScholarship(
  id: string,
  _prev: ScholarshipFormState,
  formData: FormData,
): Promise<ScholarshipFormState> {
  await assertRole("admin");
  const { data, error } = parse(formData);
  if (error) return error;

  const slug = await uniqueSlug(data.title, id);
  const updated = await db
    .update(scholarships)
    .set({ ...data, slug, updatedAt: new Date() })
    .where(eq(scholarships.id, id))
    .returning({ id: scholarships.id });
  if (!updated.length) return { status: "error", message: "This scholarship no longer exists." };
  refresh();
  redirect(`/admin/scholarships?saved=${encodeURIComponent(data.title)}`);
}

export async function setScholarshipStatus(id: string, status: ScholarshipStatus) {
  await assertRole("admin");
  await db.update(scholarships).set({ status, updatedAt: new Date() }).where(eq(scholarships.id, id));
  refresh();
}

export async function setScholarshipFeatured(id: string, featured: boolean) {
  await assertRole("admin");
  await db.update(scholarships).set({ featured, updatedAt: new Date() }).where(eq(scholarships.id, id));
  refresh();
}

export async function deleteScholarship(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    const [used] = await db.select({ id: applications.id }).from(applications).where(eq(applications.scholarshipId, id)).limit(1);
    // Students' applications must never lose their scholarship; close it instead.
    if (used) throw new UserFacingError("Students have applied to this scholarship. Mark it as closed instead of deleting it.");
    await db.delete(scholarships).where(eq(scholarships.id, id));
    refresh();
  });
}
