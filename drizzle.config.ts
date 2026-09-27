import { defineConfig } from "drizzle-kit";

// Loaded by `npm run db:*` scripts, which pass --env-file=.env.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Only manage our own tables; leave Neon Auth's schema and the legacy `users` table alone.
  schemaFilter: ["public"],
  tablesFilter: [
    "profiles",
    "user_settings",
    "site_settings",
    "scholarships",
    "saved_scholarships",
    "applications",
    "application_documents",
    "application_events",
    "document_access_log",
    "courses",
    "lessons",
    "enrollments",
    "lesson_progress",
    "certificates",
    "webinars",
    "webinar_registrations",
    "payments",
  ],
});
