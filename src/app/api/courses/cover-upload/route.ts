import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getProfile } from "@/lib/auth";
import { COVER_PREFIX, COVER_TYPES, MAX_COVER_BYTES } from "@/lib/course-cover";

/**
 * Issues a short-lived token so admins and instructors can upload a course cover straight to
 * Blob storage. The picture is only attached to a course when the course form is saved.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const profile = await getProfile();
        if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) throw new Error("Not allowed");
        if (!pathname.startsWith(COVER_PREFIX)) throw new Error("Invalid upload path");
        return { allowedContentTypes: COVER_TYPES, maximumSizeInBytes: MAX_COVER_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
