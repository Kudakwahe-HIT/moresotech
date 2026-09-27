import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Clock, Eye, Hourglass, ListVideo, Lock, PlayCircle, UserRound } from "lucide-react";
import { ProgressRing } from "@/components/applications/progress-ring";
import { EnrollButton } from "@/components/learning/buttons";
import { requireRole } from "@/lib/auth";
import { getCourseForStudent } from "@/lib/courses";
import { COURSE_CATEGORIES, formatDuration, formatPrice, hasCourseAccess } from "@/lib/learning-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Course | MoreSo Tech",
};

export default async function CoursePage({ params }: PageProps<"/dashboard/courses/[slug]">) {
  const { slug } = await params;
  const profile = await requireRole("student");
  const data = await getCourseForStudent(slug, profile.id);
  if (!data) notFound();

  const { course: c, enrollment, lessons, completedIds, certificate, percent } = data;
  const access = hasCourseAccess(enrollment?.status);
  const pending = enrollment?.status === "pending_payment";
  const instructor = [data.instructorFirst, data.instructorLast].filter(Boolean).join(" ");
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);
  const nextLesson = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];

  return (
    <div className="space-y-6">
      <Link href="/dashboard/courses" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> All courses
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-[#0f1b2d] p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-brand-blue/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/15">
              {COURSE_CATEGORIES[c.category] ?? "Course"}
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{c.title}</h2>
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-slate-300">{c.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <ListVideo className="size-4" /> {lessons.length} lessons
              </span>
              {totalMinutes > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {formatDuration(totalMinutes)}
                </span>
              )}
              {instructor && (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-4" /> {instructor}
                </span>
              )}
              {c.awardsCertificate && (
                <span className="inline-flex items-center gap-1.5 text-brand-orange">
                  <Award className="size-4" /> {c.certificateName ?? "Certificate on completion"}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {access ? (
                nextLesson && (
                  <Link href={`/dashboard/courses/${c.slug}/lessons/${nextLesson.id}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark">
                    <PlayCircle className="size-4" /> {completedIds.size ? "Continue learning" : "Start first lesson"}
                  </Link>
                )
              ) : pending ? (
                <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400/15 px-5 text-sm font-semibold text-amber-200 ring-1 ring-amber-300/30">
                  <Hourglass className="size-4" /> Request received: we&apos;ll contact you about payment
                </span>
              ) : (
                <EnrollButton courseId={c.id} free={c.priceCents === 0} priceLabel={formatPrice(c.priceCents, c.currency)} />
              )}
              {certificate && (
                <Link href={`/dashboard/certificates/${certificate.code}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15">
                  <Award className="size-4" /> View certificate
                </Link>
              )}
            </div>
            {!access && !pending && c.priceCents > 0 && (
              <p className="mt-3 text-xs text-slate-400">Online payment is coming soon. For now, request enrollment and our team will arrange payment with you.</p>
            )}
          </div>
          {access && (
            <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
              <ProgressRing percent={percent} size={80} stroke={7} tone="dark" />
              <div>
                <p className="text-sm font-semibold">Your progress</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {completedIds.size} of {lessons.length} lessons done
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="px-6 pb-3 pt-5">
            <h3 className="text-lg font-bold text-slate-900">Curriculum</h3>
          </div>
          {lessons.length ? (
            <ol className="divide-y divide-slate-100">
              {lessons.map((l, i) => {
                const open = access || l.freePreview;
                const done = completedIds.has(l.id);
                const row = (
                  <>
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        done ? "bg-emerald-500 text-white" : open ? "bg-brand-blue/10 text-brand-blue" : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {done ? <CheckCircle2 className="size-4" /> : open ? i + 1 : <Lock className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm font-semibold", open ? "text-slate-900" : "text-slate-500")}>{l.title}</span>
                      {l.summary && <span className="block truncate text-xs text-slate-500">{l.summary}</span>}
                    </span>
                    {!access && l.freePreview && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <Eye className="size-3" /> Preview
                      </span>
                    )}
                    {l.durationMinutes && <span className="shrink-0 text-xs text-slate-400">{formatDuration(l.durationMinutes)}</span>}
                  </>
                );
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link href={`/dashboard/courses/${c.slug}/lessons/${l.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-slate-50">
                        {row}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 px-6 py-3.5">{row}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="px-6 pb-6 text-sm text-slate-500">Lessons are being prepared.</p>
          )}
        </section>

        <aside className="space-y-6 xl:self-start">
          {c.outcomes.length > 0 && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="mb-4 text-base font-bold text-slate-900">What you&apos;ll learn</h3>
              <ul className="space-y-3">
                {c.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {o}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {c.description && (
            <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="mb-3 text-base font-bold text-slate-900">About this course</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{c.description}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
