import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { courses, payments } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/application-rules";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/learning-rules";
import { receiptNumber } from "@/lib/payment-rules";
import { PaymentStatusView } from "./payment-status";

export const metadata: Metadata = {
  title: "Payment | MoreSo Tech",
};

/** Pesepay's return URL and our own processing page for on-phone payments. */
export default async function PaymentPage({ params }: PageProps<"/dashboard/payments/[id]">) {
  const { id } = await params;
  const profile = await requireRole("student");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [row] = await db
    .select({ payment: payments, courseTitle: courses.title, courseSlug: courses.slug })
    .from(payments)
    .innerJoin(courses, eq(courses.id, payments.courseId))
    .where(and(eq(payments.id, id), eq(payments.profileId, profile.id)))
    .limit(1);
  if (!row) notFound();
  const p = row.payment;
  const amountLabel = formatPrice(p.amountCents, p.currency);
  const maskedPhone = p.payerPhone ? `${p.payerPhone.slice(0, 3)}••••${p.payerPhone.slice(-3)}` : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <section className="rounded-3xl bg-white px-6 py-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-10">
        <PaymentStatusView
          paymentId={p.id}
          initialStatus={p.status}
          initialDescription={p.gatewayStatusDescription}
          flow={p.flow === "redirect" ? "redirect" : "seamless"}
          methodName={p.methodName}
          instructions={p.instructions}
          maskedPhone={maskedPhone}
          amountLabel={amountLabel}
          courseTitle={row.courseTitle}
          courseHref={`/dashboard/courses/${row.courseSlug}`}
          checkoutHref={`/dashboard/checkout/${row.courseSlug}`}
          createdAt={p.createdAt.toISOString()}
        />
      </section>

      {/* Receipt details (always shown; the paid state makes it a printable receipt) */}
      <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <h2 className="text-base font-bold text-slate-900">{p.status === "paid" ? "Receipt" : "Payment details"}</h2>
        <dl className="mt-3 divide-y divide-slate-100 text-sm">
          <Row label="Receipt number" value={receiptNumber(p.id)} mono />
          <Row label="Course" value={row.courseTitle} />
          <Row label="Amount" value={amountLabel} />
          <Row label="Method" value={p.methodName} />
          <Row label="Date" value={formatDateTime(p.paidAt ?? p.createdAt)} />
          {p.referenceNumber && <Row label="Pesepay reference" value={p.referenceNumber} mono />}
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs font-semibold text-slate-800" : "text-right font-medium text-slate-800"}>{value}</dd>
    </div>
  );
}
