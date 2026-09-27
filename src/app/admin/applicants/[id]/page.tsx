import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { count, inArray } from "drizzle-orm";
import { ArrowLeft, CalendarDays, ExternalLink, Mail, MessageSquareQuote, ScrollText } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/applications/badges";
import { ProgressRing } from "@/components/applications/progress-ring";
import { RequirementList } from "@/components/applications/requirement-list";
import { Timeline } from "@/components/applications/timeline";
import { UserAvatar } from "@/components/shell/user-avatar";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { documentAccessLog } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/application-rules";
import { getApplicationForAdmin } from "@/lib/applications";
import { DecisionPanel, DocumentReviewButtons } from "../review-controls";

export const metadata: Metadata = {
  title: "Applicant | Back office",
};

export default async function ApplicantPage({ params }: PageProps<"/admin/applicants/[id]">) {
  const { id } = await params;
  const data = await getApplicationForAdmin(id);
  if (!data) notFound();

  const { application: app, scholarship: s, student, progress, events, documents } = data;
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email;
  const docIds = documents.map((d) => d.id);
  const [views] = docIds.length
    ? await db.select({ n: count() }).from(documentAccessLog).where(inArray(documentAccessLog.documentId, docIds))
    : [{ n: 0 }];

  return (
    <div className="space-y-6">
      <Link href="/admin/applicants" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Applicants
      </Link>

      {/* Header */}
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <UserAvatar imageUrl={student.imageUrl ?? ""} hasImage={Boolean(student.imageUrl)} name={name} size={64} className="ring-4 ring-slate-100" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold text-slate-900">{name}</h2>
              <ApplicationStatusBadge status={app.status} />
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              <Mail className="size-3.5 shrink-0" />
              <a href={`mailto:${student.email}`} className="truncate hover:text-brand-blue">
                {student.email}
              </a>
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{s.title}</span>
              <DeadlineChip deadline={s.deadline} />
              <Link href={`/admin/scholarships/${s.id}/edit`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline">
                Scholarship <ExternalLink className="size-3" />
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing percent={progress.percent} size={72} stroke={7} />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">
              {progress.verified}/{progress.total} verified
            </p>
            {progress.pending > 0 && <p className="text-amber-700">{progress.pending} awaiting your review</p>}
            {progress.needsRevision > 0 && <p className="text-red-600">{progress.needsRevision} sent back</p>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="px-6 pb-4 pt-5">
              <h3 className="text-lg font-bold text-slate-900">Documents</h3>
              <p className="mt-0.5 text-sm text-slate-500">Open each file, then verify it or ask the student for a new one.</p>
            </div>
            <RequirementList
              items={progress.items}
              renderActions={(item) =>
                item.document && item.status !== "needs_revision" ? (
                  <DocumentReviewButtons documentId={item.document.id} label={item.label} status={item.status} />
                ) : null
              }
            />
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="mb-5 text-lg font-bold text-slate-900">Activity</h3>
            <Timeline events={events} audience="admin" />
          </section>
        </div>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="text-base font-bold text-slate-900">Decision</h3>
            <p className="mb-4 mt-0.5 text-xs text-slate-500">The student is notified in their dashboard.</p>
            <DecisionPanel applicationId={app.id} status={app.status} />
            {app.reviewerNote && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <MessageSquareQuote className="mt-px size-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-semibold">Last note to student: </span>
                  {app.reviewerNote}
                </span>
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-base font-bold text-slate-900">Details</h3>
            <dl className="divide-y divide-slate-100 text-sm">
              <Row icon={<CalendarDays className="size-4" />} label="Started" value={formatDateTime(app.createdAt)} />
              <Row icon={<CalendarDays className="size-4" />} label="Submitted" value={app.submittedAt ? formatDateTime(app.submittedAt) : "Not yet"} />
              {app.decidedAt && <Row icon={<CalendarDays className="size-4" />} label="Decided" value={formatDateTime(app.decidedAt)} />}
              <Row icon={<ScrollText className="size-4" />} label="Document views logged" value={String(views.n)} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="flex items-center gap-2 text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

