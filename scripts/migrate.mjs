// Applies every db/migrations/*.sql file in order. Safe to re-run: migrations use IF NOT EXISTS.
// Usage: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const dir = join(import.meta.dirname, "..", "db", "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const source = await readFile(join(dir, file), "utf8");
  // The HTTP driver runs one statement per query, so split on semicolons at line ends.
  const statements = source
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  console.log(`✓ ${file}`);
}
