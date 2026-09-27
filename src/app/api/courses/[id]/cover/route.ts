import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { isUuid } from "@/lib/applications";

/**
 * Serves a course's cover picture. Published courses are public (landing page, catalogue) and
 * cached hard, because the URL changes whenever the picture does. Drafts are staff-only.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/courses/[id]/cover">) {
  const { id } = await params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });

  const [course] = await db
    .select({ coverImage: courses.coverImage, status: courses.status, instructorId: courses.instructorId })
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  if (!course?.coverImage) return new Response("Not found", { status: 404 });

  const isPublic = course.status === "published";
  if (!isPublic) {
    const profile = await getProfile();
    const staff = profile && (profile.role === "admin" || (profile.role === "instructor" && profile.id === course.instructorId));
    if (!staff) return new Response("Not found", { status: 404 });
  }

  const file = await get(course.coverImage, { access: "private" });
  if (!file || file.statusCode !== 200) return new Response("Not found", { status: 404 });

  return new Response(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType ?? "image/webp",
      "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
