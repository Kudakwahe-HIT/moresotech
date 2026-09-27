import type { PaymentStatus } from "@/db/schema";

// Plain data: safe to import from client and server components.

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: string }> = {
  pending: { label: "Processing", tone: "bg-amber-50 text-amber-700" },
  paid: { label: "Paid", tone: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", tone: "bg-red-50 text-red-600" },
  cancelled: { label: "Cancelled", tone: "bg-slate-100 text-slate-500" },
};

/** Zimbabwe mobile numbers: accept 07XXXXXXXX, 7XXXXXXXX or +2637XXXXXXXX; send 07XXXXXXXX. */
export function normalizeZwPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const m = digits.match(/^(?:\+?263|0)?(7\d{8})$/);
  return m ? `0${m[1]}` : null;
}

/** Friendly receipt number from the payment id, e.g. MST-PAY-3F9A21C0. */
export function receiptNumber(paymentId: string) {
  return `MST-PAY-${paymentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
