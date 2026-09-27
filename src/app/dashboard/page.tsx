import type { Metadata } from "next";
import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  Check,
  CircleCheck,
  ClipboardCheck,
  GraduationCap,
  Mail,
  ShieldCheck,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { listClosingSoon } from "@/lib/scholarships";
import { eq, sql } from "drizzle-orm";
import { applications, certificates, enrollments } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNotifications } from "@/lib/notifications";
import { listCoursesForStudent } from "@/lib/courses";
import { nextWebinarsForStudent } from "@/lib/webinars";
import { ProgressRing } from "@/components/applications/progress-ring";
import { Countdown, LocalTime } from "@/components/learning/time";
import { CalendarCard } from "@/components/shell/calendar-card";
import { UserAvatar } from "@/components/shell/user-avatar";

export const metadata: Metadata = {
  title: "Dashboard | MoreSo Tech",
};

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google",
  microsoft: "Microsoft",
  linkedin_oidc: "LinkedIn",
  linkedin: "LinkedIn",
};

export default async function DashboardPage() {
  // proxy.ts guarantees a signed-in user here.
  const [user, closingSoon, profile] = await Promise.all([
    currentUser().then((u) => u!),
    listClosingSoon(4),
    requireRole("student", "instructor", "admin"),
  ]);
  // The single most important thing to do right now (brief: "one primary action per login").
  const [notifications, [firstApplication]] = await Promise.all([
    getNotifications(user, profile.id),
    db.select({ id: applications.id }).from(applications).where(eq(applications.profileId, profile.id)).limit(1),
  ]);
  const nextStep = notifications.find((n) => n.actionRequired);
  const [myCoursesAll, webinarsSoon] = await Promise.all([listCoursesForStudent(profile.id, "mine"), nextWebinarsForStudent(profile.id, 3)]);
  const myCourses = myCoursesAll.filter((c) => c.enrollmentStatus !== "completed").slice(0, 3);
  const hasApplication = Boolean(firstApplication);

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const provider = user.externalAccounts[0]?.provider.replace(/^oauth_/, "");
  const signInMethod = provider ? (PROVIDER_NAMES[provider] ?? provider) : "Email & password";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Course data doesn't exist yet, so these start at zero rather than showing made-up numbers.
  // Real counts from the learning and applications tables.
  const [[counts]] = await Promise.all([
    db
      .select({
        inProgress: sql<number>`count(*) filter (where ${enrollments.status} = 'active')::int`,
        completed: sql<number>`count(*) filter (where ${enrollments.status} = 'completed')::int`,
        certificates: sql<number>`(select count(*)::int from ${certificates} c where c.profile_id = ${profile.id})`,
        applications: sql<number>`(select count(*)::int from ${applications} a where a.profile_id = ${profile.id})`,
      })
      .from(enrollments)
      .where(eq(enrollments.profileId, profile.id)),
  ]);
  const stats: { label: string; value: string; hint: string; icon: LucideIcon; tone: string; href: string }[] = [
    { label: "Courses in progress", value: String(counts.inProgress), hint: counts.inProgress ? "Keep going!" : "Enroll to get started", icon: BookOpen, tone: "bg-brand-blue/10 text-brand-blue", href: "/dashboard/courses?tab=mine" },
    { label: "Completed", value: String(counts.completed), hint: "Courses finished", icon: CircleCheck, tone: "bg-emerald-500/10 text-emerald-600", href: "/dashboard/courses?tab=mine" },
    { label: "Certificates", value: String(counts.certificates), hint: "Verifiable online", icon: Award, tone: "bg-brand-orange/10 text-brand-orange-dark", href: "/dashboard/courses?tab=certificates" },
    { label: "Applications", value: String(counts.applications), hint: "Scholarships you're applying for", icon: ClipboardCheck, tone: "bg-violet-500/10 text-violet-600", href: "/dashboard/applications" },
  ];

  const checklist = [
    { label: "Create your account", done: true },
    { label: "Verify your email address", done: emailVerified },
    { label: "Add a profile photo", done: user.hasImage },
    { label: "Start your first application", done: hasApplication },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const percent = Math.round((completed / checklist.length) * 100);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main column */}
      <div className="min-w-0 space-y-6">
        {nextStep && (
          <section
            aria-label="Your next step"
            className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-orange to-[#f79a45] p-5 text-white shadow-[0_16px_40px_-16px_rgba(245,130,32,0.7)] sm:flex-row sm:items-center sm:p-6"
          >
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/15 blur-2xl" />
            <div className="relative min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">Your next step</p>
              <h2 className="mt-1 text-lg font-bold leading-snug sm:text-xl">{nextStep.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-white/90">{nextStep.body}</p>
            </div>
            <Link
              href={nextStep.href}
              className="relative inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-bold text-brand-orange-dark shadow-sm transition hover:bg-orange-50 sm:self-center"
            >
              {nextStep.cta} <ArrowRight className="size-4" />
            </Link>
          </section>
        )}

        <section aria-labelledby="progress-heading">
          <SectionTitle id="progress-heading">Your progress</SectionTitle>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="block rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", stat.tone)}>
                    <stat.icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold leading-tight text-slate-800">{stat.label}</p>
                </div>
                <p className="mt-4 text-[1.75rem] font-bold leading-none tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-1.5 text-xs text-slate-400">{stat.hint}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming webinars (real data) */}
          <Card className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upcoming webinars</h2>
                <p className="mt-0.5 text-sm text-slate-500">Live sessions with experts</p>
              </div>
              <Link href="/dashboard/webinars" className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
                View all
              </Link>
            </div>
            {webinarsSoon.length ? (
              <ul className="mt-4 space-y-2">
                {webinarsSoon.map((w) => (
                  <li key={w.id}>
                    <Link href="/dashboard/webinars" className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-slate-50">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1b2d] text-white">
                        <Video className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{w.title}</span>
                        <span className="block truncate text-xs text-slate-500">
                          <LocalTime iso={w.startsAt.toISOString()} />
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange-dark">
                        <Countdown iso={w.startsAt.toISOString()} durationMinutes={w.durationMinutes} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Video} title="No sessions scheduled" body="New webinars will appear here as soon as they're announced." className="flex-1" />
            )}
          </Card>

          {/* Scholarships closing soon (real data) */}
          <Card className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Closing soon</h2>
                <p className="mt-0.5 text-sm text-slate-500">Scholarship deadlines coming up</p>
              </div>
              <Link href="/dashboard/scholarships" className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
                View all
              </Link>
            </div>
            {closingSoon.length ? (
              <ul className="mt-4 space-y-2">
                {closingSoon.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/dashboard/scholarships/${s.slug}`}
                      className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-slate-50"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                        <GraduationCap className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{s.title}</span>
                        <span className="block truncate text-xs text-slate-500">{s.university ?? s.provider}</span>
                      </span>
                      <DeadlineChip deadline={s.deadline} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming deadlines"
                body="New scholarships will appear here as soon as they're published."
                className="flex-1"
              />
            )}
          </Card>
        </div>

        {/* Courses you're taking (real data) */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Courses you&apos;re taking</h2>
            <Link href="/dashboard/courses?tab=mine" className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
              My learning
            </Link>
          </div>
          {myCourses.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {myCourses.map(({ course, lessonCount, completedCount, enrollmentStatus }) => {
                const pct = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;
                return (
                  <li key={course.id}>
                    <Link href={`/dashboard/courses/${course.slug}`} className="flex items-center gap-4 py-3 transition hover:opacity-80">
                      <ProgressRing percent={pct} size={44} stroke={5} className="[&_span]:text-[0.65rem]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{course.title}</span>
                        <span className="block text-xs text-slate-500">
                          {enrollmentStatus === "pending_payment" ? "Awaiting payment confirmation" : `${completedCount} of ${lessonCount} lessons`}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-slate-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No courses yet"
              body="Enroll in a language or test-prep course to build the certificates scholarships ask for."
            />
          )}
        </Card>
      </div>

      {/* Right column */}
      <aside className="min-w-0 space-y-6">
        {/* Getting started (dark promo card) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0f1b2d] p-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-orange/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-brand-blue/40 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold">Your learning journey</h2>
            <p className="mt-1 text-sm text-slate-300">
              {completed} of {checklist.length} steps complete
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-orange" style={{ width: `${percent}%` }} />
            </div>
            <ul className="mt-5 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full",
                      item.done ? "bg-brand-orange text-white" : "border-2 border-white/20",
                    )}
                  >
                    {item.done && <Check className="size-3" strokeWidth={3.5} />}
                  </span>
                  <span className={cn(item.done ? "text-slate-400 line-through" : "font-medium text-white")}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CalendarCard />

        {/* Account */}
        <Card>
          <div className="px-6 pb-4 pt-5">
            <h2 className="text-lg font-bold text-slate-900">Your account</h2>
          </div>
          <div className="flex items-center gap-3.5 px-6">
            <UserAvatar
              imageUrl={user.imageUrl}
              hasImage={user.hasImage}
              name={user.fullName ?? email}
              size={48}
              className="ring-4 ring-slate-100"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user.fullName ?? "Learner"}</p>
              <p className="truncate text-sm text-slate-500">{email}</p>
            </div>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            <AccountRow icon={ShieldCheck} label="Signed in with" value={signInMethod} />
            <AccountRow
              icon={Mail}
              label="Email"
              value={
                emailVerified ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CircleCheck className="size-3.5" /> Verified
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600">Not verified</span>
                )
              }
            />
            <AccountRow icon={UserRound} label="Member since" value={memberSince} />
          </dl>
        </Card>
      </aside>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-4 text-lg font-bold text-slate-900">
      {children}
    </h2>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

function EmptyState({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-8 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

function AccountRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3.5">
      <dt className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4 text-slate-400" />
        {label}
      </dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
