"use server";

import { and, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { PesepayError } from "pesepay";
import { db } from "@/lib/db";
import { courses, enrollments, payments, type PaymentStatus } from "@/db/schema";
import { isUuid } from "@/lib/applications";
import { assertRole } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/learning-rules";
import { normalizeZwPhone } from "@/lib/payment-rules";
import { appBaseUrl, applyGatewayResult, getPesepay, listPaymentMethods, syncPayment } from "@/lib/payments";

type StartResult = { error: string } | { paymentId: string; redirectUrl?: string };

/**
 * Starts a Pesepay payment for a course. The amount always comes from the course price here on the
 * server. On-page methods (e.g. EcoCash) send a prompt to the payer's phone; others (cards) return
 * a Pesepay-hosted URL to redirect to.
 */
export async function startCoursePayment(input: { courseId: string; methodCode: string; fields: Record<string, string> }): Promise<StartResult> {
  const profile = await assertRole("student");
  const client = getPesepay();
  if (!client) return { error: "Online payment isn't available right now. Please request enrollment instead." };
  if (!isUuid(input.courseId)) return { error: "Course not found." };

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, input.courseId), eq(courses.status, "published")))
    .limit(1);
  if (!course || course.priceCents <= 0) return { error: "This course isn't available for purchase." };

  const [enrollment] = await db
    .select({ status: enrollments.status })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.profileId, profile.id)))
    .limit(1);
  if (hasCourseAccess(enrollment?.status)) return { error: "You already have access to this course." };

  const amount = course.priceCents / 100;
  let method;
  try {
    method = (await listPaymentMethods(course.currency, amount)).find((m) => m.code === input.methodCode);
  } catch {
    return { error: "We couldn't reach the payment service. Please try again in a moment." };
  }
  if (!method) return { error: "Choose a payment method." };

  // Validate the method's own required fields (e.g. the mobile number for EcoCash).
  const requiredFields: Record<string, string> = {};
  let phone: string | null = null;
  for (const field of method.requiredFields ?? []) {
    let value = (input.fields[field.name] ?? "").trim();
    if (!value && !field.optional) return { error: `Enter your ${field.displayName ?? field.name}.` };
    if (value && /phone/i.test(field.name)) {
      const normalized = normalizeZwPhone(value);
      if (!normalized) return { error: "Enter a valid mobile number, e.g. 0771234567." };
      value = normalized;
      phone = normalized;
    }
    if (value) requiredFields[field.name] = value.slice(0, 100);
  }

  const user = await currentUser();
  const flow = method.redirectRequired ? "redirect" : "seamless";
  const [payment] = await db
    .insert(payments)
    .values({
      profileId: profile.id,
      courseId: course.id,
      amountCents: course.priceCents,
      currency: course.currency,
      methodCode: method.code,
      methodName: method.name,
      flow,
      payerPhone: phone,
      instructions: method.processingPaymentMessage ?? null,
    })
    .returning();

  const base = await appBaseUrl();
  const common = {
    amount,
    currencyCode: course.currency,
    reasonForPayment: `MoreSo Tech: ${course.title}`.slice(0, 100),
    merchantReference: payment.id,
    resultUrl: `${base}/api/payments/pesepay/result`,
    returnUrl: `${base}/dashboard/payments/${payment.id}`,
  };

  try {
    if (flow === "redirect") {
      const started = await client.initiateTransaction({ ...common, paymentMethodCode: method.code });
      await db
        .update(payments)
        .set({ referenceNumber: started.referenceNumber, pollUrl: started.pollUrl, redirectUrl: started.redirectUrl, updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
      return { paymentId: payment.id, redirectUrl: started.redirectUrl };
    }

    const result = await client.makeSeamlessPayment({
      ...common,
      paymentMethodCode: method.code,
      customer: { email: profile.email, phoneNumber: phone ?? undefined, name: user?.fullName ?? undefined },
      requiredFields,
    });
    await db.update(payments).set({ referenceNumber: result.referenceNumber }).where(eq(payments.id, payment.id));
    await applyGatewayResult({ ...payment, referenceNumber: result.referenceNumber }, result);
    return { paymentId: payment.id };
  } catch (error) {
    const message = error instanceof PesepayError ? error.message : "The payment couldn't be started.";
    await db
      .update(payments)
      .set({ status: "failed", gatewayStatus: "ERROR", gatewayStatusDescription: message.slice(0, 300), updatedAt: new Date() })
      .where(eq(payments.id, payment.id));
    console.error("Pesepay start failed", error);
    return { error: "The payment couldn't be started. Please check your details and try again." };
  }
}

export type PaymentSnapshot = {
  status: PaymentStatus;
  gatewayStatus: string | null;
  description: string | null;
};

/** Called by the processing page every few seconds. Always re-checks with Pesepay. */
export async function refreshPayment(paymentId: string): Promise<PaymentSnapshot | null> {
  const profile = await assertRole("student");
  if (!isUuid(paymentId)) return null;
  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.profileId, profile.id)))
    .limit(1);
  if (!payment) return null;
  let latest = payment;
  try {
    latest = await syncPayment(payment);
  } catch (error) {
    console.error("Pesepay status check failed", error);
  }
  return { status: latest.status, gatewayStatus: latest.gatewayStatus, description: latest.gatewayStatusDescription };
}
