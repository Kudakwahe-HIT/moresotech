import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CircleCheck, Lock, MessageSquareWarning, PartyPopper, ShieldCheck } from "lucide-react";
import { SubmitApplicationButton } from "@/components/applications/action-buttons";
import { ApplicationStatusBadge } from "@/components/applications/badges";
import { ProgressRing } from "@/components/applications/progress-ring";
import { RequirementList } from "@/components/applications/requirement-list";
import { Roadmap } from "@/components/applications/roadmap";
import { Timeline } from "@/components/applications/timeline";
import { UploadButton } from "@/components/applications/upload-button";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { requireRole } from "@/lib/auth";
import { ALLOWED_UPLOAD_LABEL, canStudentEdit } from "@/lib/application-rules";
import { getStudentApplication } from "@/lib/applications";

export const metadata: Metadata = {
  title: "Application | MoreSo Tech",
};

export default async function ApplicationPage({ params }: PageProps<"/dashboard/applications/[id]">) {
  const { id } = await params;
  const profile = await requireRole("student", "instructor", "admin");
  const data = await getStudentApplication(id, profile.id);
  if (!data) notFound();

  const { application: app, scholarship: s, progress, events } = data;
  const editable = canStudentEdit(app.status);
  const remaining = progress.total - progress.verified;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/applications" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> My applications
      </Link>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0f1b2d] p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-brand-blue/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ApplicationStatusBadge status={app.status} className="bg-white/10 text-white ring-1 ring-white/15" />
              <DeadlineChip deadline={s.deadline} />
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              <Link href={`/dashboard/scholarships/${s.slug}`} className="hover:underline">
                {s.title}
              </Link>
            </h2>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-300">
              <Building2 className="size-4" />
              {s.university ? `${s.university} · ${s.provider}` : s.provider}
            </p>
            {editable && (
              <div className="mt-6">
                <SubmitApplicationButton applicationId={app.id} ready={progress.allVerified} remaining={remaining} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
            <ProgressRing percent={progress.percent} size={88} stroke={8} tone="dark" label={`Application ${progress.percent}% complete`} />
            <div>
              <p className="text-sm font-semibold">Application complete</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {progress.verified} of {progress.total} verified
              </p>
              <p className="mt-2 max-w-[13rem] text-[0.7rem] leading-snug text-slate-500">
                Measures how complete your application is, not your chance of being accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviewer message / outcome */}
      {app.status === "changes_requested" && app.reviewerNote && (
        <Callout tone="orange" icon={<MessageSquareWarning className="size-5" />} title="Changes requested">
          {app.reviewerNote} Fix the items marked below, then submit again.
        </Callout>
      )}
      {app.status === "approved" && (
        <Callout tone="green" icon={<PartyPopper className="size-5" />} title="Congratulations, your application was approved!">
          {app.reviewerNote ?? "Our team will contact you with the next steps."}
        </Callout>
      )}
      {app.status === "rejected" && (
        <Callout tone="red" icon={<MessageSquareWarning className="size-5" />} title="This application wasn't successful">
          {app.reviewerNote ?? "Don't give up. Explore other scholarships that match your profile."}
        </Callout>
      )}
      {(app.status === "submitted" || app.status === "under_review") && (
        <Callout tone="blue" icon={<Lock className="size-5" />} title="Your application is with our reviewers">
          Documents are locked while it&apos;s being assessed. We&apos;ll notify you as soon as there&apos;s an update.
        </Callout>
      )}

      <Roadmap status={app.status} progress={progress} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col justify-between gap-2 px-6 pb-4 pt-5 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Documents & certificates</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {editable
                  ? `Upload each item. ${ALLOWED_UPLOAD_LABEL}.`
                  : app.status === "submitted" || app.status === "under_review"
                    ? "Locked while your application is being assessed."
                    : "Kept safely for your records."}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-500" /> Private, access-logged storage
            </p>
          </div>
          <RequirementList
            items={progress.items}
            renderActions={(item, index) =>
              editable && item.status !== "verified" ? (
                <UploadButton applicationId={app.id} requirementIndex={index} requirementLabel={item.label} replace={item.status !== "missing"} />
              ) : null
            }
          />
          {editable && progress.allVerified && progress.total > 0 && (
            <p className="flex items-center gap-2 border-t border-slate-100 bg-emerald-50/50 px-6 py-4 text-sm font-medium text-emerald-700">
              <CircleCheck className="size-4" /> Everything is verified. You can submit your application now.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] xl:self-start">
          <h3 className="mb-5 text-lg font-bold text-slate-900">Activity</h3>
          <Timeline events={events} audience="student" />
        </section>
      </div>
    </div>
  );
}

const CALLOUT_TONES = {
  orange: "bg-brand-orange/10 text-brand-orange-dark ring-brand-orange/20",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-brand-blue/5 text-brand-blue ring-brand-blue/15",
};

function Callout({ tone, icon, title, children }: { tone: keyof typeof CALLOUT_TONES; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div role="status" className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ${CALLOUT_TONES[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm opacity-90">{children}</p>
      </div>
    </div>
  );
}
