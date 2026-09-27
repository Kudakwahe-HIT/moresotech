import "server-only";
import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applicationDocuments,
  applicationEvents,
  applications,
  profiles,
  scholarships,
  type ApplicationStatus,
} from "@/db/schema";
import { computeProgress } from "@/lib/application-rules";

export async function logEvent(applicationId: string, actorId: string | null, type: string, message: string) {
  await db.insert(applicationEvents).values({ applicationId, actorId, type, message });
}

async function documentsFor(applicationIds: string[]) {
  if (!applicationIds.length) return [];
  return db
    .select()
    .from(applicationDocuments)
    .where(inArray(applicationDocuments.applicationId, applicationIds))
    .orderBy(desc(applicationDocuments.uploadedAt));
}

const scholarshipSummary = {
  id: scholarships.id,
  slug: scholarships.slug,
  title: scholarships.title,
  provider: scholarships.provider,
  university: scholarships.university,
  deadline: scholarships.deadline,
  level: scholarships.level,
};

/** A student's applications with progress, newest activity first. */
export async function listStudentApplications(profileId: string) {
  const rows = await db
    .select({ application: applications, scholarship: scholarshipSummary })
    .from(applications)
    .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
    .where(eq(applications.profileId, profileId))
    .orderBy(desc(applications.updatedAt));
  const docs = await documentsFor(rows.map((r) => r.application.id));
  return rows.map((r) => ({
    ...r,
    progress: computeProgress(
      r.application.requirements,
      docs.filter((d) => d.applicationId === r.application.id),
    ),
  }));
}

/** One application, only if it belongs to this student. */
export async function getStudentApplication(id: string, profileId: string) {
  if (!isUuid(id)) return null;
  const [row] = await db
    .select({ application: applications, scholarship: scholarshipSummary })
    .from(applications)
    .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
    .where(and(eq(applications.id, id), eq(applications.profileId, profileId)))
    .limit(1);
  if (!row) return null;
  return withDetails(row);
}

/** Any application, for the back office. */
export async function getApplicationForAdmin(id: string) {
  if (!isUuid(id)) return null;
  const [row] = await db
    .select({ application: applications, scholarship: scholarshipSummary, student: profiles })
    .from(applications)
    .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
    .innerJoin(profiles, eq(profiles.id, applications.profileId))
    .where(eq(applications.id, id))
    .limit(1);
  if (!row) return null;
  return { ...(await withDetails(row)), student: row.student };
}

async function withDetails<T extends { application: typeof applications.$inferSelect }>(row: T) {
  const [docs, events] = await Promise.all([
    documentsFor([row.application.id]),
    db
      .select({ event: applicationEvents, actorFirstName: profiles.firstName, actorRole: profiles.role })
      .from(applicationEvents)
      .leftJoin(profiles, eq(profiles.id, applicationEvents.actorId))
      .where(eq(applicationEvents.applicationId, row.application.id))
      .orderBy(desc(applicationEvents.createdAt))
      .limit(50),
  ]);
  return { ...row, documents: docs, events, progress: computeProgress(row.application.requirements, docs) };
}

export type AdminApplicationFilter = "needs_review" | ApplicationStatus | undefined;

/** Back-office list. "needs_review" = submitted/under review, or any application with files awaiting review. */
export async function listApplicationsForAdmin(filter: AdminApplicationFilter, q?: string) {
  const conditions: SQL[] = [];
  const pendingDocs = sql`exists (select 1 from ${applicationDocuments} d where d.application_id = "applications"."id" and d.status = 'pending' and d.superseded_at is null)`;
  if (filter === "needs_review") {
    conditions.push(sql`(${applications.status} in ('submitted', 'under_review') or ${pendingDocs})`);
  } else if (filter) {
    conditions.push(eq(applications.status, filter));
  }
  if (q) {
    const term = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conditions.push(
      sql`(${profiles.email} ilike ${term} or ${profiles.firstName} ilike ${term} or ${profiles.lastName} ilike ${term} or ${scholarships.title} ilike ${term})`,
    );
  }

  const rows = await db
    .select({ application: applications, scholarship: scholarshipSummary, student: profiles })
    .from(applications)
    .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
    .innerJoin(profiles, eq(profiles.id, applications.profileId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(applications.updatedAt))
    .limit(200);
  const docs = await documentsFor(rows.map((r) => r.application.id));
  return rows.map((r) => ({
    ...r,
    progress: computeProgress(r.application.requirements, docs.filter((d) => d.applicationId === r.application.id)),
  }));
}

/** Counts for the back-office overview and sidebar. */
export async function countApplicationsNeedingReview() {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(applications)
    .where(
      sql`${applications.status} in ('submitted', 'under_review') or exists (select 1 from ${applicationDocuments} d where d.application_id = "applications"."id" and d.status = 'pending' and d.superseded_at is null)`,
    );
  return row?.n ?? 0;
}

/** Current (non-superseded) documents across all of a student's applications, for the Document Vault. */
export async function listStudentDocuments(profileId: string) {
  return db
    .select({ document: applicationDocuments, applicationId: applications.id, scholarshipTitle: scholarships.title })
    .from(applicationDocuments)
    .innerJoin(applications, eq(applications.id, applicationDocuments.applicationId))
    .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
    .where(and(eq(applications.profileId, profileId), isNull(applicationDocuments.supersededAt)))
    .orderBy(asc(scholarships.title), asc(applicationDocuments.requirement));
}

export function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
