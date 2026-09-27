import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Award, BookOpen, ListVideo, Presentation, Users, Video, type LucideIcon } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { ProgressRing } from "@/components/applications/progress-ring";
import { Countdown, LocalTime } from "@/components/learning/time";
import { requireRole } from "@/lib/auth";
import { listCoursesForInstructor } from "@/lib/courses";
import { listWebinarsForInstructor } from "@/lib/webinars";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Teaching | MoreSo Tech",
};

export default async function TeachOverviewPage() {
  const profile = await requireRole("instructor", "admin");
  const [user, courses, sessions] = await Promise.all([currentUser(), listCoursesForInstructor(profile.id), listWebinarsForInstructor(profile.id)]);

  const learners = courses.reduce((n, c) => n + c.learners, 0);
  const completions = courses.reduce((n, c) => n + c.completed, 0);
  const lessons = courses.reduce((n, c) => n + c.lessonCount, 0);

  const stats: { label: string; value: number; icon: LucideIcon; tone: string }[] = [
    { label: "Courses you teach", value: courses.length, icon: Presentation, tone: "bg-brand-blue/10 text-brand-blue" },
    { label: "Active learners", value: learners, icon: Users, tone: "bg-violet-500/10 text-violet-600" },
    { label: "Completions", value: completions, icon: Award, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Lessons published", value: lessons, icon: ListVideo, tone: "bg-brand-orange/10 text-brand-orange-dark" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#0f1b2d] p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-sky-400/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Instructor</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Keep your lessons fresh and see how your learners are progressing toward their certificates.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className={cn("flex size-11 items-center justify-center rounded-full", s.tone)}>
              <s.icon className="size-5" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Your courses" href="/teach/courses" linkLabel="All courses">
          {courses.length ? (
            <ul className="divide-y divide-slate-100">
              {courses.slice(0, 5).map(({ course: c, learners: n, completed, lessonCount }) => (
                <li key={c.id}>
                  <Link href={`/teach/courses/${c.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-slate-50">
                    <ProgressRing percent={n ? Math.round((completed / n) * 100) : 0} size={44} stroke={5} label="Completion rate" className="[&_span]:text-[0.65rem]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{c.title}</span>
                      <span className="block text-xs text-slate-500">
                        {lessonCount} lesson{lessonCount === 1 ? "" : "s"} · {n} learner{n === 1 ? "" : "s"} · {c.status}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={<BookOpen className="size-6" />}>No courses are assigned to you yet. An admin assigns instructors from the back office.</Empty>
          )}
        </Panel>

        <Panel title="Upcoming sessions" href="/teach/webinars" linkLabel="All sessions">
          {sessions.length ? (
            <ul className="divide-y divide-slate-100">
              {sessions.slice(0, 4).map(({ webinar: w, courseTitle, registrations }) => (
                <li key={w.id} className="flex items-center gap-3 px-6 py-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1b2d] text-white">
                    <Video className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{w.title}</span>
                    <span className="block truncate text-xs text-slate-500">
                      <LocalTime iso={w.startsAt.toISOString()} /> · {courseTitle} · {registrations} registered
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange-dark">
                    <Countdown iso={w.startsAt.toISOString()} durationMinutes={w.durationMinutes} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={<Video className="size-6" />}>No upcoming sessions for your courses.</Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-6 pb-6 pt-2 text-sm text-slate-500">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">{icon}</span>
      {children}
    </div>
  );
}
