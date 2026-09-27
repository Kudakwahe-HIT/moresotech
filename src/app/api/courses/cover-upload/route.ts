import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getProfile } from "@/lib/auth";
import { COVER_PREFIX, COVER_TYPES, MAX_COVER_BYTES, SITE_PREFIX } from "@/lib/course-cover";

/**
 * Issues a short-lived token so staff can upload a picture straight to Blob storage: course covers
 * (admins and instructors) or public-site pictures such as the landing hero (admins only).
 * The picture is only used once the form it belongs to is saved.
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
        const allowed = pathname.startsWith(COVER_PREFIX) || (pathname.startsWith(SITE_PREFIX) && profile.role === "admin");
        if (!allowed) throw new Error("Invalid upload path");
        return { allowedContentTypes: COVER_TYPES, maximumSizeInBytes: MAX_COVER_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
