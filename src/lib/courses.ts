import "server-only";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificates, courses, enrollments, lessonProgress, lessons, profiles } from "@/db/schema";
import { isUuid } from "@/lib/applications";

const lessonCount = sql<number>`(select count(*)::int from ${lessons} l where l.course_id = "courses"."id")`;

/** Published courses with the student's enrollment and progress. */
export async function listCoursesForStudent(profileId: string, view: "all" | "mine") {
  const rows = await db
    .select({
      course: courses,
      lessonCount,
      enrollmentStatus: enrollments.status,
      completedCount: sql<number>`(select count(*)::int from ${lessonProgress} lp join ${lessons} l on l.id = lp.lesson_id where l.course_id = "courses"."id" and lp.profile_id = ${profileId})`,
      instructorFirst: profiles.firstName,
      instructorLast: profiles.lastName,
    })
    .from(courses)
    .leftJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.profileId, profileId)))
    .leftJoin(profiles, eq(profiles.id, courses.instructorId))
    .where(
      view === "mine"
        ? and(eq(courses.status, "published"), inArray(enrollments.status, ["pending_payment", "active", "completed"]))
        : eq(courses.status, "published"),
    )
    .orderBy(asc(courses.priceCents), asc(courses.title));
  return rows;
}

/** Everything the course page and lesson player need. */
export async function getCourseForStudent(slug: string, profileId: string) {
  const [row] = await db
    .select({ course: courses, enrollment: enrollments, instructorFirst: profiles.firstName, instructorLast: profiles.lastName })
    .from(courses)
    .leftJoin(enrollments, and(eq(enrollments.courseId, courses.id), eq(enrollments.profileId, profileId)))
    .leftJoin(profiles, eq(profiles.id, courses.instructorId))
    .where(and(eq(courses.slug, slug), eq(courses.status, "published")))
    .limit(1);
  if (!row) return null;

  const [courseLessons, done, [certificate]] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.courseId, row.course.id)).orderBy(asc(lessons.position)),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .where(and(eq(lessons.courseId, row.course.id), eq(lessonProgress.profileId, profileId))),
    db
      .select()
      .from(certificates)
      .where(and(eq(certificates.courseId, row.course.id), eq(certificates.profileId, profileId)))
      .limit(1),
  ]);

  const completedIds = new Set(done.map((d) => d.lessonId));
  return {
    ...row,
    lessons: courseLessons,
    completedIds,
    certificate: certificate ?? null,
    percent: courseLessons.length ? Math.round((completedIds.size / courseLessons.length) * 100) : 0,
  };
}

export async function listStudentCertificates(profileId: string) {
  return db
    .select({ certificate: certificates, courseSlug: courses.slug })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.profileId, profileId))
    .orderBy(desc(certificates.issuedAt));
}

/** Public certificate lookup for /verify. Returns only what's printed on the certificate. */
export async function verifyCertificate(code: string) {
  if (!/^[A-Z0-9-]{6,20}$/.test(code)) return null;
  const [row] = await db
    .select({
      code: certificates.code,
      recipientName: certificates.recipientName,
      certificateName: certificates.certificateName,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
    })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.code, code))
    .limit(1);
  return row ?? null;
}

// ─── Back office ───────────────────────────────────────────────────────────

export async function listCoursesForAdmin() {
  return db
    .select({
      course: courses,
      lessonCount,
      learners: sql<number>`(select count(*)::int from ${enrollments} e where e.course_id = "courses"."id" and e.status in ('active', 'completed'))`,
      pending: sql<number>`(select count(*)::int from ${enrollments} e where e.course_id = "courses"."id" and e.status = 'pending_payment')`,
      instructorFirst: profiles.firstName,
      instructorLast: profiles.lastName,
    })
    .from(courses)
    .leftJoin(profiles, eq(profiles.id, courses.instructorId))
    .orderBy(desc(courses.updatedAt));
}

export async function getCourseForAdmin(id: string) {
  if (!isUuid(id)) return null;
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course) return null;
  const [courseLessons, learners] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.courseId, id)).orderBy(asc(lessons.position)),
    db
      .select({
        enrollment: enrollments,
        student: profiles,
        completed: sql<number>`(select count(*)::int from ${lessonProgress} lp join ${lessons} l on l.id = lp.lesson_id where l.course_id = ${id} and lp.profile_id = ${enrollments.profileId})`,
      })
      .from(enrollments)
      .innerJoin(profiles, eq(profiles.id, enrollments.profileId))
      .where(eq(enrollments.courseId, id))
      .orderBy(sql`case ${enrollments.status} when 'pending_payment' then 0 else 1 end`, desc(enrollments.createdAt)),
  ]);
  return { course, lessons: courseLessons, learners };
}

export async function countPendingEnrollments() {
  const [row] = await db.select({ n: count() }).from(enrollments).where(eq(enrollments.status, "pending_payment"));
  return row?.n ?? 0;
}

export async function listInstructors() {
  return db
    .select({ id: profiles.id, firstName: profiles.firstName, lastName: profiles.lastName, email: profiles.email })
    .from(profiles)
    .where(inArray(profiles.role, ["instructor", "admin"]))
    .orderBy(asc(profiles.firstName));
}

// ─── Teaching area ─────────────────────────────────────────────────────────

/** Courses assigned to an instructor, with learner and completion counts. */
export async function listCoursesForInstructor(profileId: string) {
  return db
    .select({
      course: courses,
      lessonCount,
      learners: sql<number>`(select count(*)::int from ${enrollments} e where e.course_id = "courses"."id" and e.status in ('active', 'completed'))`,
      completed: sql<number>`(select count(*)::int from ${enrollments} e where e.course_id = "courses"."id" and e.status = 'completed')`,
    })
    .from(courses)
    .where(and(eq(courses.instructorId, profileId), sql`${courses.status} <> 'archived'`))
    .orderBy(desc(courses.updatedAt));
}

/** A course for the teaching area, only if this instructor teaches it (admins may open any). */
export async function getCourseForInstructor(id: string, profile: { id: string; role: string }) {
  const data = await getCourseForAdmin(id);
  if (!data) return null;
  if (profile.role !== "admin" && data.course.instructorId !== profile.id) return null;
  return data;
}
