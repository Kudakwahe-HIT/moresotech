import "server-only";
import { and, asc, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, enrollments, webinarRegistrations, webinars, type Webinar } from "@/db/schema";

/** Fields safe to send to the browser: everything except the join link. */
export type PublicWebinar = Omit<Webinar, "joinUrl"> & {
  courseTitle: string | null;
  courseSlug: string | null;
  registered: boolean;
  /** Student may attend (open to everyone, or enrolled in the linked course). */
  allowed: boolean;
  registrations: number;
};

function studentSelect(profileId: string) {
  return {
    id: webinars.id,
    title: webinars.title,
    description: webinars.description,
    hostName: webinars.hostName,
    startsAt: webinars.startsAt,
    durationMinutes: webinars.durationMinutes,
    recordingUrl: webinars.recordingUrl,
    access: webinars.access,
    courseId: webinars.courseId,
    cancelled: webinars.cancelled,
    createdBy: webinars.createdBy,
    createdAt: webinars.createdAt,
    updatedAt: webinars.updatedAt,
    courseTitle: courses.title,
    courseSlug: courses.slug,
    registered: sql<boolean>`exists (select 1 from ${webinarRegistrations} r where r.webinar_id = "webinars"."id" and r.profile_id = ${profileId})`,
    allowed: sql<boolean>`(${webinars.access} = 'everyone' or exists (select 1 from ${enrollments} e where e.course_id = ${webinars.courseId} and e.profile_id = ${profileId} and e.status in ('active', 'completed')))`,
    registrations: sql<number>`(select count(*)::int from ${webinarRegistrations} r where r.webinar_id = "webinars"."id")`,
  };
}

/** Upcoming (incl. in progress) and past sessions for a student. The join link is never included. */
export async function listWebinarsForStudent(profileId: string) {
  // "Upcoming" includes sessions that started up to their duration ago (still live).
  const liveCutoff = sql`${webinars.startsAt} + (${webinars.durationMinutes} || ' minutes')::interval`;
  const [upcoming, past] = await Promise.all([
    db
      .select(studentSelect(profileId))
      .from(webinars)
      .leftJoin(courses, eq(courses.id, webinars.courseId))
      .where(and(eq(webinars.cancelled, false), sql`${liveCutoff} >= now()`))
      .orderBy(asc(webinars.startsAt))
      .limit(20),
    db
      .select(studentSelect(profileId))
      .from(webinars)
      .leftJoin(courses, eq(courses.id, webinars.courseId))
      .where(and(eq(webinars.cancelled, false), sql`${liveCutoff} < now()`))
      .orderBy(desc(webinars.startsAt))
      .limit(12),
  ]);
  return { upcoming: upcoming as PublicWebinar[], past: past as PublicWebinar[] };
}

export async function nextWebinarsForStudent(profileId: string, limit: number) {
  const rows = await db
    .select(studentSelect(profileId))
    .from(webinars)
    .leftJoin(courses, eq(courses.id, webinars.courseId))
    .where(and(eq(webinars.cancelled, false), gte(webinars.startsAt, sql`now() - interval '2 hours'`)))
    .orderBy(asc(webinars.startsAt))
    .limit(limit);
  return rows as PublicWebinar[];
}

export async function listWebinarsForAdmin(when: "upcoming" | "past") {
  return db
    .select({
      webinar: webinars,
      courseTitle: courses.title,
      registrations: sql<number>`(select count(*)::int from ${webinarRegistrations} r where r.webinar_id = "webinars"."id")`,
    })
    .from(webinars)
    .leftJoin(courses, eq(courses.id, webinars.courseId))
    .where(when === "upcoming" ? gte(webinars.startsAt, sql`now() - interval '3 hours'`) : lt(webinars.startsAt, sql`now() - interval '3 hours'`))
    .orderBy(when === "upcoming" ? asc(webinars.startsAt) : desc(webinars.startsAt));
}

export async function getWebinarById(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(webinars).where(eq(webinars.id, id)).limit(1);
  return row ?? null;
}

/** Sessions linked to the courses an instructor teaches (cancelled ones included, so they can restore them). */
export async function listWebinarsForInstructor(profileId: string, when: "upcoming" | "past" = "upcoming") {
  return db
    .select({
      webinar: webinars,
      courseTitle: courses.title,
      registrations: sql<number>`(select count(*)::int from ${webinarRegistrations} r where r.webinar_id = "webinars"."id")`,
    })
    .from(webinars)
    .innerJoin(courses, eq(courses.id, webinars.courseId))
    .where(
      and(
        eq(courses.instructorId, profileId),
        when === "upcoming" ? gte(webinars.startsAt, sql`now() - interval '3 hours'`) : lt(webinars.startsAt, sql`now() - interval '3 hours'`),
      ),
    )
    .orderBy(when === "upcoming" ? asc(webinars.startsAt) : desc(webinars.startsAt))
    .limit(when === "upcoming" ? 100 : 30);
}

/** Courses an instructor can schedule sessions for. */
export async function listTaughtCourses(profileId: string) {
  return db
    .select({ id: courses.id, title: courses.title })
    .from(courses)
    .where(and(eq(courses.instructorId, profileId), ne(courses.status, "archived")))
    .orderBy(asc(courses.title));
}
