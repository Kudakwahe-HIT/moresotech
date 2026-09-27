import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.");
}

/** Typed Drizzle client over Neon's serverless HTTP driver. */
export const db = drizzle(neon(process.env.DATABASE_URL), { schema });

// Note for raw correlated subqueries: Drizzle omits the table name on columns in single-table
// queries, so reference the outer row explicitly, e.g. `where l.course_id = "courses"."id"`.
