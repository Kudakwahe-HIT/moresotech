import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, canStudentEdit } from "@/lib/application-rules";
import { isUuid } from "@/lib/applications";

/**
 * Issues a short-lived token so the browser can upload a file straight to private Blob storage
 * (no size limit from our server). Only for the signed-in owner of an editable application,
 * and only into that application's own folder.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const profile = await getProfile();
        if (!profile) throw new Error("Not signed in");

        const { applicationId } = JSON.parse(clientPayload ?? "{}") as { applicationId?: string };
        if (!applicationId || !isUuid(applicationId)) throw new Error("Invalid application");

        const [app] = await db
          .select({ status: applications.status })
          .from(applications)
          .where(and(eq(applications.id, applicationId), eq(applications.profileId, profile.id)))
          .limit(1);
        if (!app || !canStudentEdit(app.status)) throw new Error("This application can't be changed right now");
        if (!pathname.startsWith(`applications/${applicationId}/`)) throw new Error("Invalid upload path");

        return {
          allowedContentTypes: ALLOWED_UPLOAD_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
