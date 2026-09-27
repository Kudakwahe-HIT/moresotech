"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { head } from "@vercel/blob";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { applicationDocuments, applications, scholarships, type Requirement } from "@/db/schema";
import { assertRole } from "@/lib/auth";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, canStudentEdit, computeProgress } from "@/lib/application-rules";
import { isUuid, logEvent } from "@/lib/applications";
import { deadlineInfo } from "@/lib/scholarship-labels";

function refresh(applicationId?: string) {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  if (applicationId) revalidatePath(`/dashboard/applications/${applicationId}`);
}

async function ownApplication(applicationId: string, profileId: string) {
  if (!isUuid(applicationId)) throw new UserFacingError("Application not found");
  const [app] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.profileId, profileId)))
    .limit(1);
  if (!app) throw new UserFacingError("Application not found");
  return app;
}

/** Starts (or reopens) the student's application for a published, still-open scholarship. */
export async function startApplication(scholarshipId: string): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    if (!isUuid(scholarshipId)) throw new UserFacingError("Scholarship not found");

    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.profileId, profile.id), eq(applications.scholarshipId, scholarshipId)))
      .limit(1);
    if (existing) redirect(`/dashboard/applications/${existing.id}`);

    const [s] = await db
      .select()
      .from(scholarships)
      .where(and(eq(scholarships.id, scholarshipId), eq(scholarships.status, "published")))
      .limit(1);
    if (!s) throw new UserFacingError("This scholarship isn't open for applications.");
    if (deadlineInfo(s.deadline).tone === "closed") throw new UserFacingError("The deadline for this scholarship has passed.");

    const requirements: Requirement[] = [
      ...s.requiredDocuments.map((label) => ({ label, kind: "document" as const })),
      ...s.requiredCertificates.map((label) => ({ label, kind: "certificate" as const })),
    ];

    const [app] = await db
      .insert(applications)
      .values({ profileId: profile.id, scholarshipId, requirements })
      .returning({ id: applications.id });
    await logEvent(app.id, profile.id, "started", `Started the application for ${s.title}`);
    refresh();
    redirect(`/dashboard/applications/${app.id}`);
  });
}

/**
 * Called after the browser finishes uploading straight to Blob storage. Re-checks everything on the
 * server (ownership, the file really exists in this application's folder, type and size) before saving.
 */
export async function recordUpload(input: { applicationId: string; requirementIndex: number; pathname: string; fileName: string }): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    const app = await ownApplication(input.applicationId, profile.id);
    if (!canStudentEdit(app.status)) throw new UserFacingError("This application can't be changed right now.");

    const requirement = app.requirements[input.requirementIndex];
    if (!requirement) throw new UserFacingError("Unknown requirement");
    if (!input.pathname.startsWith(`applications/${app.id}/`)) throw new UserFacingError("Invalid upload");

    const blob = await head(input.pathname);
    if (blob.size > MAX_UPLOAD_BYTES || !ALLOWED_UPLOAD_TYPES.includes(blob.contentType)) {
      throw new UserFacingError("That file type or size isn't allowed.");
    }

    const now = new Date();
    // Keep earlier uploads as version history.
    await db
      .update(applicationDocuments)
      .set({ supersededAt: now })
      .where(
        and(
          eq(applicationDocuments.applicationId, app.id),
          eq(applicationDocuments.requirement, requirement.label),
          eq(applicationDocuments.kind, requirement.kind),
          isNull(applicationDocuments.supersededAt),
        ),
      );
    await db.insert(applicationDocuments).values({
      applicationId: app.id,
      requirement: requirement.label,
      kind: requirement.kind,
      blobPathname: blob.pathname,
      fileName: input.fileName.slice(0, 200),
      contentType: blob.contentType,
      sizeBytes: blob.size,
    });
    await db.update(applications).set({ updatedAt: now }).where(eq(applications.id, app.id));
    await logEvent(app.id, profile.id, "uploaded", `Uploaded ${requirement.label}`);
    refresh(app.id);
  });
}

/** Sends the application for assessment. Only allowed once every requirement is verified. */
export async function submitApplication(applicationId: string): Promise<ActionResult> {
  return runAction(async () => {
    const profile = await assertRole("student");
    const app = await ownApplication(applicationId, profile.id);
    if (!canStudentEdit(app.status)) throw new UserFacingError("This application has already been submitted.");

    const docs = await db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, app.id));
    if (!computeProgress(app.requirements, docs).allVerified) {
      throw new UserFacingError("Every document must be verified before you can submit.");
    }

    const now = new Date();
    await db
      .update(applications)
      .set({ status: "submitted", submittedAt: now, updatedAt: now })
      .where(eq(applications.id, app.id));
    await logEvent(app.id, profile.id, "submitted", "Submitted the application for assessment");
    refresh(app.id);
  });
}
