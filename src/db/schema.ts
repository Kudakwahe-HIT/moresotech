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
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "pending_payment", // requested a paid course; waiting for staff to confirm payment
  "active",
  "completed",
  "cancelled",
]);
export const webinarAccessEnum = pgEnum("webinar_access", ["everyone", "enrolled"]);
/** Our own simplified view of a payment; Pesepay's detailed status is kept alongside. */
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "cancelled"]);

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

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description"),
    category: text("category").notNull(), // language | test_prep | documents | interview | other
    /** Price in cents; 0 = free. */
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    outcomes: text("outcomes").array().notNull().default([]),
    instructorId: text("instructor_id").references(() => profiles.id, { onDelete: "set null" }),
    awardsCertificate: boolean("awards_certificate").notNull().default(true),
    certificateName: text("certificate_name"),
    status: courseStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("courses_status_idx").on(t.status)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content"),
    /** YouTube / Vimeo / other link. */
    videoUrl: text("video_url"),
    durationMinutes: integer("duration_minutes"),
    freePreview: boolean("free_preview").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lessons_course_position_idx").on(t.courseId, t.position)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull(),
    /** Staff member who confirmed payment / activated access. */
    activatedBy: text("activated_by").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("enrollments_course_profile_key").on(t.courseId, t.profileId), index("enrollments_status_idx").on(t.status)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.lessonId] })],
);

/** Issued when a student completes every lesson. `code` powers the public /verify page. */
export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    /** Frozen at issue time so later edits don't change an issued certificate. */
    recipientName: text("recipient_name").notNull(),
    certificateName: text("certificate_name").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("certificates_profile_course_key").on(t.profileId, t.courseId)],
);

export const webinars = pgTable(
  "webinars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    hostName: text("host_name").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    /** Zoom / Google Meet link. Never sent to the browser until the session opens. */
    joinUrl: text("join_url").notNull(),
    recordingUrl: text("recording_url"),
    access: webinarAccessEnum("access").notNull().default("everyone"),
    /** Required when access = enrolled. */
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    cancelled: boolean("cancelled").notNull().default(false),
    createdBy: text("created_by").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("webinars_starts_at_idx").on(t.startsAt)],
);

export const webinarRegistrations = pgTable(
  "webinar_registrations",
  {
    webinarId: uuid("webinar_id")
      .notNull()
      .references(() => webinars.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.webinarId, t.profileId] })],
);

/** One row per checkout attempt through Pesepay. */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    /** Charged amount, always taken from the course price on the server. */
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    /** Pesepay's own status, e.g. PROCESSING, SUCCESS, INSUFFICIENT_FUNDS. */
    gatewayStatus: text("gateway_status"),
    gatewayStatusDescription: text("gateway_status_description"),
    referenceNumber: text("reference_number").unique(),
    pollUrl: text("poll_url"),
    redirectUrl: text("redirect_url"),
    methodCode: text("method_code").notNull(),
    methodName: text("method_name").notNull(),
    /** "seamless" = paid on our page (e.g. EcoCash push); "redirect" = Pesepay's hosted page (cards). */
    flow: text("flow").notNull(),
    payerPhone: text("payer_phone"),
    /** How the Pesepay prompt tells the customer what to do, shown on the processing page. */
    instructions: text("instructions"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /** Set once when the course is unlocked, so a payment can never be fulfilled twice. */
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payments_profile_idx").on(t.profileId, t.createdAt), index("payments_status_idx").on(t.status)],
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
export type Course = typeof courses.$inferSelect;
export type CourseStatus = (typeof courseStatusEnum.enumValues)[number];
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type EnrollmentStatus = (typeof enrollmentStatusEnum.enumValues)[number];
export type Certificate = typeof certificates.$inferSelect;
export type Webinar = typeof webinars.$inferSelect;
export type WebinarAccess = (typeof webinarAccessEnum.enumValues)[number];
export type Payment = typeof payments.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
