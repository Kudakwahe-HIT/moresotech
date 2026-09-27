// Sets a user's role. Use it to create the first admin (after they have signed in once).
// Usage: npm run set-role -- you@example.com admin
//        roles: student | instructor | admin
import { neon } from "@neondatabase/serverless";

const [email, role] = process.argv.slice(2);
const ROLES = ["student", "instructor", "admin"];

if (!email || !ROLES.includes(role)) {
  console.error("Usage: npm run set-role -- <email> <student|instructor|admin>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  update profiles set role = ${role}, updated_at = now()
  where lower(email) = lower(${email})
  returning email, role
`;

if (rows.length === 0) {
  console.error(`No profile for ${email}. Sign in to the app once with that account, then run this again.`);
  process.exit(1);
}
console.log(`✓ ${rows[0].email} is now ${rows[0].role}`);
