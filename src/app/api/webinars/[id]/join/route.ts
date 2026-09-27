import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments, webinarRegistrations } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { webinarWindow } from "@/lib/learning-rules";
import { getWebinarById } from "@/lib/webinars";

/**
 * The only way a student reaches a Zoom/Meet link: must be signed in, registered, allowed,
 * and within the join window. Keeps links from being shared ahead of time.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/webinars/[id]/join">) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  const webinar = await getWebinarById(id);
  if (!webinar || webinar.cancelled) return new Response("Session not found", { status: 404 });

  const staff = profile.role === "admin" || profile.role === "instructor";
  if (!staff) {
    const [registered] = await db
      .select({ id: webinarRegistrations.webinarId })
      .from(webinarRegistrations)
      .where(and(eq(webinarRegistrations.webinarId, id), eq(webinarRegistrations.profileId, profile.id)))
      .limit(1);
    if (!registered) return redirect("/dashboard/webinars?error=register");

    if (webinar.access === "enrolled" && webinar.courseId) {
      const [enrolled] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.courseId, webinar.courseId), eq(enrollments.profileId, profile.id), inArray(enrollments.status, ["active", "completed"])))
        .limit(1);
      if (!enrolled) return redirect("/dashboard/webinars?error=access");
    }
    if (!webinarWindow(webinar.startsAt, webinar.durationMinutes).canJoin) return redirect("/dashboard/webinars?error=early");
  }

  redirect(webinar.joinUrl);
}
