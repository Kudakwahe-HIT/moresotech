"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/db/schema";
import { runAction, UserFacingError, type ActionResult } from "@/lib/action-result";
import { isUuid } from "@/lib/applications";
import { assertRole } from "@/lib/auth";
import { syncPayment } from "@/lib/payments";

/** Ask Pesepay for the latest status of a payment that's still processing. */
export async function recheckPayment(paymentId: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertRole("admin");
    if (!isUuid(paymentId)) throw new UserFacingError("Payment not found");
    const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    if (!payment) throw new UserFacingError("Payment not found");
    try {
      await syncPayment(payment);
    } catch {
      throw new UserFacingError("Couldn't reach Pesepay. Try again shortly.");
    }
    revalidatePath("/admin/payments");
    revalidatePath("/admin", "layout");
  });
}
