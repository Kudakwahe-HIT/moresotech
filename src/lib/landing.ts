import "server-only";
import { and, asc, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificates, courses, lessons, profiles, scholarships, webinars } from "@/db/schema";

/**
 * Everything the public landing page shows. Only published content, and only fields that are
 * already visible to any student (no join links, no personal data beyond instructor names).
 */
export async function getLandingData() {
  const openScholarship = and(eq(scholarships.status, "published"), or(isNull(scholarships.deadline), gte(scholarships.deadline, sql`current_date`)));

  const [[stats], featuredScholarships, featuredCourses, upcomingSessions] = await Promise.all([
    db
      .select({
        scholarships: sql<number>`(select count(*)::int from ${scholarships} where ${openScholarship})`,
        courses: sql<number>`(select count(*)::int from ${courses} where ${courses.status} = 'published')`,
        certificates: sql<number>`(select count(*)::int from ${certificates})`,
        sessions: sql<number>`(select count(*)::int from ${webinars} where ${webinars.cancelled} = false and ${webinars.startsAt} >= now())`,
      })
      .from(sql`(select 1) as one`),
    db
      .select({
        id: scholarships.id,
        slug: scholarships.slug,
        title: scholarships.title,
        provider: scholarships.provider,
        university: scholarships.university,
        level: scholarships.level,
        fundingType: scholarships.fundingType,
        amount: scholarships.amount,
        summary: scholarships.summary,
        deadline: scholarships.deadline,
      })
      .from(scholarships)
      .where(openScholarship)
      .orderBy(desc(scholarships.featured), sql`${scholarships.deadline} asc nulls last`)
      .limit(3),
    db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        subtitle: courses.subtitle,
        category: courses.category,
        coverImage: courses.coverImage,
        priceCents: courses.priceCents,
        currency: courses.currency,
        awardsCertificate: courses.awardsCertificate,
        lessonCount: sql<number>`(select count(*)::int from ${lessons} l where l.course_id = "courses"."id")`,
        instructorFirst: profiles.firstName,
        instructorLast: profiles.lastName,
      })
      .from(courses)
      .leftJoin(profiles, eq(profiles.id, courses.instructorId))
      .where(eq(courses.status, "published"))
      // Courses with a picture first: they make the page.
      .orderBy(sql`${courses.coverImage} is null`, desc(courses.updatedAt))
      .limit(6),
    db
      .select({ id: webinars.id, title: webinars.title, hostName: webinars.hostName, startsAt: webinars.startsAt, durationMinutes: webinars.durationMinutes, access: webinars.access })
      .from(webinars)
      .where(and(eq(webinars.cancelled, false), gte(webinars.startsAt, sql`now()`)))
      .orderBy(asc(webinars.startsAt))
      .limit(3),
  ]);

  return { stats, featuredScholarships, featuredCourses, upcomingSessions };
}
