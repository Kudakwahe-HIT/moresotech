"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { applicationDocuments, applications, type ApplicationStatus } from "@/db/schema";
import { assertRole } from "@/lib/auth";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { isUuid, logEvent } from "@/lib/applications";

function refresh(applicationId: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/admin/applicants/${applicationId}`);
}

const cleanNote = (note?: string) => note?.trim().slice(0, 1000) || null;

/** Verify a document, or send it back to the student with a note explaining what to fix. */
export async function reviewDocument(documentId: string, decision: "verified" | "needs_revision", note?: string): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await assertRole("admin");
    if (!isUuid(documentId)) throw new UserFacingError("Document not found");
    const reviewNote = cleanNote(note);
    if (decision === "needs_revision" && !reviewNote) throw new UserFacingError("Tell the student what needs fixing.");

    const [doc] = await db
      .update(applicationDocuments)
      .set({ status: decision, reviewNote, reviewedBy: admin.id, reviewedAt: new Date() })
      .where(and(eq(applicationDocuments.id, documentId), isNull(applicationDocuments.supersededAt)))
      .returning();
    if (!doc) throw new UserFacingError("This document was replaced. Refresh to see the latest upload.");

    const [app] = await db.select().from(applications).where(eq(applications.id, doc.applicationId)).limit(1);
    const now = new Date();

    // A document rejected after submission sends the whole application back to the student.
    if (decision === "needs_revision" && app && ["submitted", "under_review"].includes(app.status)) {
      await db
        .update(applications)
        .set({ status: "changes_requested", reviewerNote: `${doc.requirement}: ${reviewNote}`, reviewerId: admin.id, updatedAt: now })
        .where(eq(applications.id, app.id));
    } else {
      await db.update(applications).set({ updatedAt: now }).where(eq(applications.id, doc.applicationId));
    }

    await logEvent(
      doc.applicationId,
      admin.id,
      decision === "verified" ? "document_verified" : "document_revision",
      decision === "verified" ? `${doc.requirement} verified by MoreSo Tech` : `${doc.requirement} needs revision: ${reviewNote}`,
    );
    refresh(doc.applicationId);
  });
}

type Decision = Extract<ApplicationStatus, "under_review" | "changes_requested" | "approved" | "rejected">;

const ALLOWED_FROM: Record<Decision, ApplicationStatus[]> = {
  under_review: ["submitted"],
  changes_requested: ["submitted", "under_review"],
  approved: ["submitted", "under_review"],
  rejected: ["submitted", "under_review"],
};

const EVENT_MESSAGE: Record<Decision, string> = {
  under_review: "Assessment started",
  changes_requested: "Changes requested",
  approved: "Application approved",
  rejected: "Application not successful",
};

/** Move an application through assessment. */
export async function decideApplication(applicationId: string, decision: Decision, note?: string): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await assertRole("admin");
    if (!isUuid(applicationId)) throw new UserFacingError("Application not found");
    const reviewerNote = cleanNote(note);
    if ((decision === "changes_requested" || decision === "rejected") && !reviewerNote) {
      throw new UserFacingError("Add a note so the student knows why.");
    }

    const [app] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!app) throw new UserFacingError("Application not found");
    if (!ALLOWED_FROM[decision].includes(app.status)) throw new UserFacingError("That change isn't possible from the current status.");

    const now = new Date();
    await db
      .update(applications)
      .set({
        status: decision,
        reviewerId: admin.id,
        updatedAt: now,
        ...(reviewerNote !== null || decision !== "under_review" ? { reviewerNote } : {}),
        ...(decision === "approved" || decision === "rejected" ? { decidedAt: now } : {}),
      })
      .where(eq(applications.id, applicationId));

    await logEvent(applicationId, admin.id, decision, reviewerNote ? `${EVENT_MESSAGE[decision]}: ${reviewerNote}` : EVENT_MESSAGE[decision]);
    refresh(applicationId);
  });
}
