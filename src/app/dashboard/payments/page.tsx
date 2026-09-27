import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Receipt } from "lucide-react";
import { courses, payments } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/application-rules";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/learning-rules";
import { PAYMENT_STATUS, receiptNumber } from "@/lib/payment-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payments & receipts | MoreSo Tech",
};

export default async function PaymentsPage() {
  const profile = await requireRole("student");
  const rows = await db
    .select({ payment: payments, courseTitle: courses.title })
    .from(payments)
    .innerJoin(courses, eq(courses.id, payments.courseId))
    .where(eq(payments.profileId, profile.id))
    .orderBy(desc(payments.createdAt))
    .limit(100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments & receipts</h2>
        <p className="mt-1 text-sm text-slate-500">Every payment you&apos;ve made on MoreSo Tech. Open one to view or print its receipt.</p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ payment: p, courseTitle }) => (
              <li key={p.id}>
                <Link href={`/dashboard/payments/${p.id}`} className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Receipt className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{courseTitle}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {receiptNumber(p.id)} · {p.methodName} · {formatDateTime(p.createdAt)}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-slate-900">{formatPrice(p.amountCents, p.currency)}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", PAYMENT_STATUS[p.status].tone)}>{PAYMENT_STATUS[p.status].label}</span>
                  <ArrowRight className="size-4 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Receipt className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No payments yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Receipts for courses and certificates you buy will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
