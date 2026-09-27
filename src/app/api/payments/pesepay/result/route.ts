import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/db/schema";
import { getPesepay, syncPayment } from "@/lib/payments";

/**
 * Pesepay's result URL (server-to-server). The callback only carries the integration key as a
 * credential, so after checking it we still re-fetch the status from Pesepay's API rather than
 * trusting the posted body, then unlock the course if it's paid.
 */
export async function POST(request: Request) {
  const client = getPesepay();
  if (!client) return new Response("Payments not configured", { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { result, keyVerified } = client.parseCallback(body, Object.fromEntries(request.headers));
  if (!keyVerified) return new Response("Unauthorized", { status: 401 });

  const [payment] = await db.select().from(payments).where(eq(payments.referenceNumber, result.referenceNumber)).limit(1);
  // Unknown reference: acknowledge so Pesepay doesn't keep retrying, but do nothing.
  if (!payment) return Response.json({ ok: true });

  try {
    await syncPayment(payment);
  } catch (error) {
    console.error("Pesepay result sync failed", error);
    // Ask Pesepay to retry later.
    return new Response("Retry", { status: 502 });
  }
  return Response.json({ ok: true });
}
