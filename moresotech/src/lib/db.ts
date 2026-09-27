import "server-only";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.");
}

/** Neon serverless SQL client. Use as a tagged template: sql`select ... where id = ${id}` (values are parameterised). */
export const sql = neon(process.env.DATABASE_URL);
