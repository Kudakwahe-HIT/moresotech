import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { CircleAlert, CircleDollarSign, Hourglass, Receipt, TrendingUp, type LucideIcon } from "lucide-react";
import { courses, payments, profiles, type PaymentStatus } from "@/db/schema";
import { formatDateTime } from "@/lib/application-rules";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/learning-rules";
import { PAYMENT_STATUS, receiptNumber } from "@/lib/payment-rules";
import { paymentsEnabled } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { RecheckButton } from "./recheck-button";

export const metadata: Metadata = {
  title: "Payments | Back office",
};

const TABS: { label: string; value?: PaymentStatus }[] = [
  { label: "All" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "pending" },
  { label: "Failed", value: "failed" },
];

export default async function AdminPaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const { status: raw } = await searchParams;
  const status = TABS.find((t) => t.value && t.value === raw)?.value;

  const [[totals], rows] = await Promise.all([
    db
      .select({
        month: sql<number>`coalesce(sum(${payments.amountCents}) filter (where ${payments.status} = 'paid' and ${payments.paidAt} >= date_trunc('month', now())), 0)::int`,
        all: sql<number>`coalesce(sum(${payments.amountCents}) filter (where ${payments.status} = 'paid'), 0)::int`,
        paidCount: sql<number>`count(*) filter (where ${payments.status} = 'paid')::int`,
        pending: sql<number>`count(*) filter (where ${payments.status} = 'pending')::int`,
      })
      .from(payments),
    db
      .select({ payment: payments, courseTitle: courses.title, email: profiles.email, firstName: profiles.firstName, lastName: profiles.lastName })
      .from(payments)
      .innerJoin(courses, eq(courses.id, payments.courseId))
      .innerJoin(profiles, eq(profiles.id, payments.profileId))
      .where(status ? eq(payments.status, status) : undefined)
      .orderBy(desc(payments.createdAt))
      .limit(200),
  ]);

  const stats: { label: string; value: string; icon: LucideIcon; tone: string }[] = [
    { label: "Revenue this month", value: formatPrice(totals.month), icon: TrendingUp, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Total collected", value: formatPrice(totals.all), icon: CircleDollarSign, tone: "bg-brand-blue/10 text-brand-blue" },
    { label: "Successful payments", value: String(totals.paidCount), icon: Receipt, tone: "bg-violet-500/10 text-violet-600" },
    { label: "Still processing", value: String(totals.pending), icon: Hourglass, tone: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h2>
        <p className="mt-1 text-sm text-slate-500">Course payments through Pesepay. Paid courses unlock automatically.</p>
      </div>

      {!paymentsEnabled() && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          Pesepay isn&apos;t connected yet, so students see &ldquo;Request enrollment&rdquo; instead of checkout. Add PESEPAY_INTEGRATION_KEY and
          PESEPAY_ENCRYPTION_KEY to turn it on.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className={cn("flex size-11 items-center justify-center rounded-full", s.tone)}>
              <s.icon className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{s.label}</p>
          </div>
        ))}
      </div>

      <nav aria-label="Filter payments" className="flex w-fit rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/payments?status=${t.value}` : "/admin/payments"}
            aria-current={status === t.value ? "page" : undefined}
            className={cn("inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold transition", status === t.value ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ payment: p, courseTitle, email, firstName, lastName }) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {[firstName, lastName].filter(Boolean).join(" ") || email} · {courseTitle}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {receiptNumber(p.id)} · {p.methodName}
                    {p.referenceNumber ? ` · Pesepay ${p.referenceNumber}` : ""} · {formatDateTime(p.createdAt)}
                  </p>
                  {p.status === "failed" && p.gatewayStatusDescription && <p className="mt-0.5 text-xs text-red-600">{p.gatewayStatusDescription}</p>}
                </div>
                <span className="text-sm font-bold text-slate-900">{formatPrice(p.amountCents, p.currency)}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", PAYMENT_STATUS[p.status].tone)}>{PAYMENT_STATUS[p.status].label}</span>
                {p.status === "pending" && p.referenceNumber && <RecheckButton paymentId={p.id} />}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Receipt className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No payments yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Payments will appear here as students buy courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
