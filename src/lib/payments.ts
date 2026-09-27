import "server-only";
import { headers } from "next/headers";
import { and, eq, isNull, ne } from "drizzle-orm";
import { isTerminal, Pesepay, TRANSACTION_STATUS_DESCRIPTIONS, type PaymentMethod, type PaymentResult } from "pesepay";
import { db } from "@/lib/db";
import { enrollments, payments, type Payment, type PaymentStatus } from "@/db/schema";

const SANDBOX_BASE_URL = "https://api.test.pesepay.com/api/payments-engine";

/**
 * Pesepay client, or null when keys aren't configured (the app then falls back to
 * "request enrollment" + manual confirmation). PESEPAY_ENV=sandbox uses Pesepay's test API.
 */
export function getPesepay(): Pesepay | null {
  const integrationKey = process.env.PESEPAY_INTEGRATION_KEY;
  const encryptionKey = process.env.PESEPAY_ENCRYPTION_KEY;
  if (!integrationKey || !encryptionKey) return null;
  return new Pesepay({
    integrationKey,
    encryptionKey,
    baseUrl: process.env.PESEPAY_ENV === "sandbox" ? SANDBOX_BASE_URL : undefined,
    timeoutMs: 20_000,
  });
}

export function paymentsEnabled() {
  return Boolean(process.env.PESEPAY_INTEGRATION_KEY && process.env.PESEPAY_ENCRYPTION_KEY);
}

// Payment methods rarely change: cache them per currency for 10 minutes.
const methodCache = new Map<string, { at: number; methods: PaymentMethod[] }>();

/** Active methods that can take this amount, cheapest-to-integrate first (on-page before redirect). */
export async function listPaymentMethods(currency: string, amount: number): Promise<PaymentMethod[]> {
  const client = getPesepay();
  if (!client) return [];
  const cached = methodCache.get(currency);
  let methods = cached && Date.now() - cached.at < 10 * 60_000 ? cached.methods : null;
  if (!methods) {
    methods = await client.getPaymentMethods(currency);
    methodCache.set(currency, { at: Date.now(), methods });
  }
  return methods
    .filter((m) => m.active !== false)
    .filter((m) => (m.minimumAmount == null || amount >= m.minimumAmount) && (m.maximumAmount == null || amount <= m.maximumAmount))
    .sort((a, b) => Number(paymentFlow(a) === "redirect") - Number(paymentFlow(b) === "redirect"));
}

/**
 * Which flow a method uses on our side. Only phone-prompt methods (e.g. EcoCash, Omari) run on our
 * own page. Everything else goes to Pesepay's hosted page: cards (so card numbers never touch our
 * servers, keeping us out of PCI DSS scope) and methods like InnBucks that show a QR code there.
 */
export function paymentFlow(method: PaymentMethod): "seamless" | "redirect" {
  if (method.redirectRequired) return "redirect";
  const fields = method.requiredFields ?? [];
  const phoneOnly = fields.length > 0 && fields.every((f) => /phone/i.test(f.name));
  const touchesCard = fields.some((f) => /card|cvv|security|expiry/i.test(f.name));
  return phoneOnly && !touchesCard ? "seamless" : "redirect";
}

/** Pesepay's status → our four states. */
export function toPaymentStatus(gatewayStatus: string): PaymentStatus {
  if (gatewayStatus === "SUCCESS") return "paid";
  if (gatewayStatus === "CANCELLED") return "cancelled";
  return isTerminal(gatewayStatus) ? "failed" : "pending";
}

export function describeGatewayStatus(status: string) {
  return (TRANSACTION_STATUS_DESCRIPTIONS as Record<string, string>)[status] ?? status;
}

/** Absolute base URL of this deployment, for Pesepay's return and result URLs. */
export async function appBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Saves a Pesepay result on the payment and unlocks the course when it's paid. */
export async function applyGatewayResult(payment: Payment, result: PaymentResult) {
  const status = toPaymentStatus(result.transactionStatus);
  const now = new Date();
  const [updated] = await db
    .update(payments)
    .set({
      status,
      gatewayStatus: result.transactionStatus,
      gatewayStatusDescription: result.transactionStatusDescription ?? describeGatewayStatus(result.transactionStatus),
      pollUrl: result.pollUrl ?? payment.pollUrl,
      paidAt: status === "paid" ? (payment.paidAt ?? now) : payment.paidAt,
      updatedAt: now,
    })
    .where(eq(payments.id, payment.id))
    .returning();
  if (status === "paid") await fulfillPayment(updated);
  return updated;
}

/**
 * Asks Pesepay for the latest status (never trusts the browser) and updates the payment.
 * Safe to call repeatedly: the processing page polls it and the result URL calls it.
 */
export async function syncPayment(payment: Payment): Promise<Payment> {
  if (payment.status !== "pending" || !payment.referenceNumber) return payment;
  const client = getPesepay();
  if (!client) return payment;
  const result = await client.checkPayment(payment.referenceNumber);
  return applyGatewayResult(payment, result);
}

/** Unlocks the course exactly once, even if the callback and the poller race each other. */
export async function fulfillPayment(payment: Payment) {
  const [claimed] = await db
    .update(payments)
    .set({ fulfilledAt: new Date() })
    .where(and(eq(payments.id, payment.id), eq(payments.status, "paid"), isNull(payments.fulfilledAt)))
    .returning({ id: payments.id });
  if (!claimed) return;
  // Unlock (new, pending, or previously cancelled); leave "completed" untouched.
  await db
    .insert(enrollments)
    .values({ courseId: payment.courseId, profileId: payment.profileId, status: "active", activatedAt: new Date() })
    .onConflictDoUpdate({
      target: [enrollments.courseId, enrollments.profileId],
      set: { status: "active", activatedAt: new Date() },
      setWhere: ne(enrollments.status, "completed"),
    });
}
