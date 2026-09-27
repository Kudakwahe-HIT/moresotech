import { boolean, date, index, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "instructor", "admin"]);
export const scholarshipLevelEnum = pgEnum("scholarship_level", [
  "language",
  "undergraduate",
  "masters",
  "phd",
  "research",
]);
export const fundingTypeEnum = pgEnum("funding_type", ["full", "partial", "tuition", "stipend"]);
export const scholarshipStatusEnum = pgEnum("scholarship_status", ["draft", "published", "closed"]);

/**
 * One row per Clerk user, created on first visit to the app. Clerk owns sign-in;
 * this table owns app data such as the user's role.
 */
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  role: roleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scholarships = pgTable(
  "scholarships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    provider: text("provider").notNull(),
    university: text("university"),
    country: text("country").notNull().default("South Korea"),
    level: scholarshipLevelEnum("level").notNull(),
    fundingType: fundingTypeEnum("funding_type").notNull(),
    /** Free text, e.g. "Full tuition + monthly stipend". */
    amount: text("amount"),
    summary: text("summary").notNull(),
    description: text("description"),
    eligibility: text("eligibility").array().notNull().default([]),
    benefits: text("benefits").array().notNull().default([]),
    requiredDocuments: text("required_documents").array().notNull().default([]),
    requiredCertificates: text("required_certificates").array().notNull().default([]),
    intake: text("intake"),
    opensAt: date("opens_at"),
    deadline: date("deadline"),
    applyUrl: text("apply_url"),
    status: scholarshipStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    createdBy: text("created_by").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("scholarships_status_deadline_idx").on(t.status, t.deadline)],
);

export const savedScholarships = pgTable(
  "saved_scholarships",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    scholarshipId: uuid("scholarship_id")
      .notNull()
      .references(() => scholarships.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.scholarshipId] })],
);

export type Profile = typeof profiles.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type Scholarship = typeof scholarships.$inferSelect;
export type NewScholarship = typeof scholarships.$inferInsert;
export type ScholarshipLevel = (typeof scholarshipLevelEnum.enumValues)[number];
export type FundingType = (typeof fundingTypeEnum.enumValues)[number];
export type ScholarshipStatus = (typeof scholarshipStatusEnum.enumValues)[number];
