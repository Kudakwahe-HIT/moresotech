import { get } from "@vercel/blob";
import { getSiteSettings } from "@/lib/settings";

/** The landing page hero picture. Public, and cached hard because the URL changes with the picture. */
export async function GET() {
  const { heroImage } = await getSiteSettings();
  if (!heroImage) return new Response("Not found", { status: 404 });
  const file = await get(heroImage, { access: "private" });
  if (!file || file.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType ?? "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
