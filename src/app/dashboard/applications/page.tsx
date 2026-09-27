import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, GraduationCap } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/applications/badges";
import { ProgressRing } from "@/components/applications/progress-ring";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { requireRole } from "@/lib/auth";
import type { ApplicationProgress } from "@/lib/application-rules";
import type { ApplicationStatus } from "@/db/schema";
import { listStudentApplications } from "@/lib/applications";

export const metadata: Metadata = {
  title: "My applications | MoreSo Tech",
};

/** One-line "what now?" for each application card. */
function nextStep(status: ApplicationStatus, progress: ApplicationProgress) {
  if (status === "changes_requested") return "Fix the items your reviewer flagged";
  if (status === "submitted") return "Waiting for a reviewer";
  if (status === "under_review") return "Being assessed by our team";
  if (status === "approved") return "Approved: we'll be in touch";
  if (status === "rejected") return "Not successful this time";
  if (status === "withdrawn") return "Withdrawn";
  if (progress.needsRevision) return progress.needsRevision === 1 ? "1 document needs revision" : `${progress.needsRevision} documents need revision`;
  if (progress.allVerified) return "Ready to submit";
  const missing = progress.total - progress.uploaded;
  if (missing) return `${missing} item${missing === 1 ? "" : "s"} left to upload`;
  return "Documents awaiting verification";
}

export default async function ApplicationsPage() {
  const profile = await requireRole("student");
  const items = await listStudentApplications(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">My applications</h2>
        <p className="mt-1 text-sm text-slate-500">Track every scholarship you&apos;re applying for, step by step.</p>
      </div>

      {items.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map(({ application: app, scholarship: s, progress }) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="group flex flex-col rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] hover:ring-slate-200"
            >
              <div className="flex items-start gap-4">
                <ProgressRing percent={progress.percent} size={60} />
                <div className="min-w-0 flex-1">
                  <ApplicationStatusBadge status={app.status} />
                  <h3 className="mt-2 font-bold leading-snug text-slate-900">{s.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                    <Building2 className="size-3.5 shrink-0" />
                    <span className="truncate">{s.university ?? s.provider}</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700">{nextStep(app.status, progress)}</p>
                <span className="flex items-center gap-2">
                  <DeadlineChip deadline={s.deadline} />
                  <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
            <ClipboardCheck className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No applications yet</h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
            Find a scholarship you qualify for and press &ldquo;Start application&rdquo;. We&apos;ll guide you through every document.
          </p>
          <Link
            href="/dashboard/scholarships"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
          >
            <GraduationCap className="size-4" /> Browse scholarships
          </Link>
        </div>
      )}
    </div>
  );
}
