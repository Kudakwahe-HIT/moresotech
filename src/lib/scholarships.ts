import "server-only";
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  savedScholarships,
  scholarships,
  type FundingType,
  type ScholarshipLevel,
  type ScholarshipStatus,
} from "@/db/schema";
import { FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";

export type ScholarshipSort = "deadline" | "newest" | "title";

export type ScholarshipFilters = {
  q?: string;
  level?: ScholarshipLevel;
  funding?: FundingType;
  sort?: ScholarshipSort;
  savedBy?: string;
};

/** Parses untrusted search params into known filter values (anything unknown is ignored). */
export function parseFilters(params: Record<string, string | string[] | undefined>): ScholarshipFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const level = one(params.level);
  const funding = one(params.funding);
  const sort = one(params.sort);
  return {
    q: one(params.q)?.slice(0, 100),
    level: level && level in LEVEL_LABELS ? (level as ScholarshipLevel) : undefined,
    funding: funding && funding in FUNDING_LABELS ? (funding as FundingType) : undefined,
    sort: sort === "newest" || sort === "title" ? sort : "deadline",
  };
}

function searchCondition(q: string): SQL | undefined {
  const term = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  return or(
    ilike(scholarships.title, term),
    ilike(scholarships.provider, term),
    ilike(scholarships.university, term),
    ilike(scholarships.summary, term),
  );
}

function orderFor(sort: ScholarshipSort | undefined) {
  if (sort === "newest") return [desc(scholarships.createdAt)];
  if (sort === "title") return [asc(scholarships.title)];
  // Soonest deadline first; open-ended (no deadline) last.
  return [sql`${scholarships.deadline} asc nulls last`, asc(scholarships.title)];
}

/** Published scholarships for students. Closed ones stay visible in the catalogue but sort last. */
export async function listPublishedScholarships(filters: ScholarshipFilters, profileId: string) {
  const conditions = [eq(scholarships.status, "published")];
  if (filters.q) conditions.push(searchCondition(filters.q)!);
  if (filters.level) conditions.push(eq(scholarships.level, filters.level));
  if (filters.funding) conditions.push(eq(scholarships.fundingType, filters.funding));
  if (filters.savedBy) {
    conditions.push(
      sql`exists (select 1 from ${savedScholarships} s where s.scholarship_id = ${scholarships.id} and s.profile_id = ${filters.savedBy})`,
    );
  }

  const rows = await db
    .select({
      scholarship: scholarships,
      saved: sql<boolean>`exists (select 1 from ${savedScholarships} s where s.scholarship_id = ${scholarships.id} and s.profile_id = ${profileId})`,
    })
    .from(scholarships)
    .where(and(...conditions))
    .orderBy(desc(scholarships.featured), ...orderFor(filters.sort));

  return rows.map((r) => ({ ...r.scholarship, saved: r.saved }));
}

export async function getPublishedScholarship(slug: string, profileId: string) {
  const [row] = await db
    .select({
      scholarship: scholarships,
      saved: sql<boolean>`exists (select 1 from ${savedScholarships} s where s.scholarship_id = ${scholarships.id} and s.profile_id = ${profileId})`,
    })
    .from(scholarships)
    .where(and(eq(scholarships.slug, slug), eq(scholarships.status, "published")))
    .limit(1);
  return row ? { ...row.scholarship, saved: row.saved } : null;
}

/** Everything, for the back office. */
export async function listAllScholarships(filters: { q?: string; status?: ScholarshipStatus }) {
  const conditions: SQL[] = [];
  if (filters.q) conditions.push(searchCondition(filters.q)!);
  if (filters.status) conditions.push(eq(scholarships.status, filters.status));
  return db
    .select()
    .from(scholarships)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(scholarships.updatedAt));
}

export async function getScholarshipById(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(scholarships).where(eq(scholarships.id, id)).limit(1);
  return row ?? null;
}

/** Published scholarships whose deadline is today or later, soonest first. */
export async function listClosingSoon(limit: number) {
  return db
    .select()
    .from(scholarships)
    .where(and(eq(scholarships.status, "published"), sql`${scholarships.deadline} >= current_date`))
    .orderBy(asc(scholarships.deadline))
    .limit(limit);
}

/** Turns a title into a URL slug; adds a short suffix when the slug is taken. */
export async function uniqueSlug(title: string, ignoreId?: string) {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .slice(0, 80) || "scholarship";
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const [taken] = await db.select({ id: scholarships.id }).from(scholarships).where(eq(scholarships.slug, slug)).limit(1);
    if (!taken || taken.id === ignoreId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}
