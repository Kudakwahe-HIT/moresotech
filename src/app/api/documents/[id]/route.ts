import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applicationDocuments, applications, documentAccessLog } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { isUuid } from "@/lib/applications";

/**
 * Streams a private document to its owner or an admin. Files are never publicly reachable;
 * every view is recorded in the access log.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/documents/[id]">) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) return new Response("Not signed in", { status: 401 });
  if (!isUuid(id)) return new Response("Not found", { status: 404 });

  const [doc] = await db
    .select({ document: applicationDocuments, ownerId: applications.profileId })
    .from(applicationDocuments)
    .innerJoin(applications, eq(applications.id, applicationDocuments.applicationId))
    .where(eq(applicationDocuments.id, id))
    .limit(1);

  // Same 404 for "doesn't exist" and "not yours", so ids can't be probed.
  if (!doc || (doc.ownerId !== profile.id && profile.role !== "admin")) {
    return new Response("Not found", { status: 404 });
  }

  const file = await get(doc.document.blobPathname, { access: "private" });
  if (!file || file.statusCode !== 200) return new Response("File missing", { status: 404 });

  await db.insert(documentAccessLog).values({ documentId: id, actorId: profile.id });

  const download = new URL(request.url).searchParams.has("download");
  const safeName = doc.document.fileName.replace(/[^\w.\- ]/g, "_");
  return new Response(file.stream, {
    headers: {
      "Content-Type": doc.document.contentType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
