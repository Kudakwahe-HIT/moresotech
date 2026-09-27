import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

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
export const applicationStatusEnum = pgEnum("application_status", [
  "draft", // student is gathering documents
  "submitted", // all documents verified, sent for assessment
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "withdrawn",
]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "verified", "needs_revision"]);
export const requirementKindEnum = pgEnum("requirement_kind", ["document", "certificate"]);

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

export type Requirement = { label: string; kind: "document" | "certificate" };

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    scholarshipId: uuid("scholarship_id")
      .notNull()
      .references(() => scholarships.id, { onDelete: "restrict" }),
    status: applicationStatusEnum("status").notNull().default("draft"),
    /** Snapshot of the scholarship's requirements when the application started, so later edits don't move the goalposts. */
    requirements: jsonb("requirements").$type<Requirement[]>().notNull().default([]),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    /** Latest message from the reviewer to the student (changes requested, decision reason). */
    reviewerNote: text("reviewer_note"),
    reviewerId: text("reviewer_id").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("applications_profile_scholarship_key").on(t.profileId, t.scholarshipId),
    index("applications_status_idx").on(t.status),
  ],
);

/** Every uploaded file. Re-uploading keeps the old row (supersededAt set) as version history. */
export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    requirement: text("requirement").notNull(),
    kind: requirementKindEnum("kind").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: documentStatusEnum("status").notNull().default("pending"),
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by").references(() => profiles.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
  },
  (t) => [index("application_documents_application_idx").on(t.applicationId, t.requirement)],
);

/** Timeline shown to students and admins. */
export const applicationEvents = pgTable(
  "application_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => profiles.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("application_events_application_idx").on(t.applicationId, t.createdAt)],
);

/** Who opened which document and when (passports etc. are sensitive). */
export const documentAccessLog = pgTable(
  "document_access_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => applicationDocuments.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("document_access_log_document_idx").on(t.documentId)],
);

export type Profile = typeof profiles.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type Scholarship = typeof scholarships.$inferSelect;
export type NewScholarship = typeof scholarships.$inferInsert;
export type ScholarshipLevel = (typeof scholarshipLevelEnum.enumValues)[number];
export type FundingType = (typeof fundingTypeEnum.enumValues)[number];
export type ScholarshipStatus = (typeof scholarshipStatusEnum.enumValues)[number];
export type Application = typeof applications.$inferSelect;
export type ApplicationStatus = (typeof applicationStatusEnum.enumValues)[number];
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type DocumentStatus = (typeof documentStatusEnum.enumValues)[number];
export type ApplicationEvent = typeof applicationEvents.$inferSelect;
