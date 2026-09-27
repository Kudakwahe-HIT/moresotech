import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applicationDocuments,
  applicationEvents,
  applications,
  certificates,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  payments,
  savedScholarships,
  scholarships,
  userSettings,
  webinarRegistrations,
  webinars,
} from "@/db/schema";
import { getProfile } from "@/lib/auth";

/**
 * "Download my data": everything we hold about the signed-in user, as one JSON file.
 * Uploaded files themselves stay in the Document Vault; this lists them.
 */
export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Not signed in", { status: 401 });
  const me = profile.id;

  const [settings, saved, apps, documents, events, learning, completedLessons, certs, sessions, paymentRows] = await Promise.all([
    db.select().from(userSettings).where(eq(userSettings.profileId, me)),
    db
      .select({ scholarship: scholarships.title, savedAt: savedScholarships.createdAt })
      .from(savedScholarships)
      .innerJoin(scholarships, eq(scholarships.id, savedScholarships.scholarshipId))
      .where(eq(savedScholarships.profileId, me)),
    db
      .select({
        id: applications.id,
        scholarship: scholarships.title,
        status: applications.status,
        requirements: applications.requirements,
        reviewerNote: applications.reviewerNote,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
      })
      .from(applications)
      .innerJoin(scholarships, eq(scholarships.id, applications.scholarshipId))
      .where(eq(applications.profileId, me)),
    db
      .select({
        applicationId: applicationDocuments.applicationId,
        fileName: applicationDocuments.fileName,
        contentType: applicationDocuments.contentType,
        status: applicationDocuments.status,
        uploadedAt: applicationDocuments.uploadedAt,
        replacedAt: applicationDocuments.supersededAt,
      })
      .from(applicationDocuments)
      .innerJoin(applications, eq(applications.id, applicationDocuments.applicationId))
      .where(eq(applications.profileId, me)),
    db
      .select({ applicationId: applicationEvents.applicationId, type: applicationEvents.type, at: applicationEvents.createdAt })
      .from(applicationEvents)
      .innerJoin(applications, eq(applications.id, applicationEvents.applicationId))
      .where(eq(applications.profileId, me))
      .orderBy(desc(applicationEvents.createdAt)),
    db
      .select({ course: courses.title, status: enrollments.status, enrolledAt: enrollments.createdAt })
      .from(enrollments)
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.profileId, me)),
    db
      .select({ course: courses.title, lesson: lessons.title, completedAt: lessonProgress.completedAt })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(courses, eq(courses.id, lessons.courseId))
      .where(eq(lessonProgress.profileId, me)),
    db
      .select({ code: certificates.code, name: certificates.certificateName, recipient: certificates.recipientName, issuedAt: certificates.issuedAt })
      .from(certificates)
      .where(eq(certificates.profileId, me)),
    db
      .select({ session: webinars.title, startsAt: webinars.startsAt, registeredAt: webinarRegistrations.createdAt })
      .from(webinarRegistrations)
      .innerJoin(webinars, eq(webinars.id, webinarRegistrations.webinarId))
      .where(eq(webinarRegistrations.profileId, me)),
    db
      .select({
        course: courses.title,
        amountCents: payments.amountCents,
        currency: payments.currency,
        method: payments.methodName,
        status: payments.status,
        reference: payments.referenceNumber,
        createdAt: payments.createdAt,
        paidAt: payments.paidAt,
      })
      .from(payments)
      .innerJoin(courses, eq(courses.id, payments.courseId))
      .where(eq(payments.profileId, me)),
  ]);

  const { id, email, firstName, lastName, role, createdAt } = profile;
  const data = {
    exportedAt: new Date().toISOString(),
    account: { id, email, firstName, lastName, role, createdAt },
    settings: settings[0] ?? null,
    savedScholarships: saved,
    applications: apps.map((a) => ({
      ...a,
      documents: documents.filter((d) => d.applicationId === a.id),
      history: events.filter((e) => e.applicationId === a.id),
    })),
    courses: learning,
    completedLessons,
    certificates: certs,
    sessions,
    payments: paymentRows,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="moresotech-my-data-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
