import type { Metadata } from "next";
import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import {
  Award,
  BookOpen,
  CalendarClock,
  Check,
  CircleCheck,
  Flame,
  GraduationCap,
  Mail,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { listClosingSoon } from "@/lib/scholarships";
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

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default async function DashboardPage() {
  // proxy.ts guarantees a signed-in user here.
  const [user, closingSoon] = await Promise.all([currentUser().then((u) => u!), listClosingSoon(4)]);

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
  const stats: { label: string; value: string; hint: string; icon: LucideIcon; tone: string }[] = [
    { label: "Courses in progress", value: "0", hint: "Enroll to get started", icon: BookOpen, tone: "bg-brand-blue/10 text-brand-blue" },
    { label: "Completed", value: "0", hint: "Finish a course to see it here", icon: CircleCheck, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Certificates", value: "0", hint: "Earned on completion", icon: Award, tone: "bg-brand-orange/10 text-brand-orange-dark" },
    { label: "Learning streak", value: "0 days", hint: "Learn daily to build it", icon: Flame, tone: "bg-rose-500/10 text-rose-600" },
  ];

  const checklist = [
    { label: "Create your account", done: true },
    { label: "Verify your email address", done: emailVerified },
    { label: "Add a profile photo", done: user.hasImage },
    { label: "Enroll in your first course", done: false },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const percent = Math.round((completed / checklist.length) * 100);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main column */}
      <div className="min-w-0 space-y-6">
        <section aria-labelledby="progress-heading">
          <SectionTitle id="progress-heading">Your progress</SectionTitle>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", stat.tone)}>
                    <stat.icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold leading-tight text-slate-800">{stat.label}</p>
                </div>
                <p className="mt-4 text-[1.75rem] font-bold leading-none tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-1.5 text-xs text-slate-400">{stat.hint}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Learning activity */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Learning activity</h2>
                <p className="mt-0.5 text-sm text-slate-500">Hours spent learning this week</p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                Weekly
              </span>
            </div>
            <ActivityChart />
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

        {/* Courses you're taking */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Courses you&apos;re taking</h2>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
              Active
            </span>
          </div>
          <EmptyState
            icon={GraduationCap}
            title="No courses yet"
            body="When you enroll in a course, it will appear here with your progress so you can jump straight back in."
          />
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

/** Empty weekly chart: axes and day labels are real, bars appear once learning time is tracked. */
function ActivityChart() {
  const today = new Date().getDay();
  return (
    <div className="relative mt-6">
      <div className="grid grid-cols-[2rem_1fr] gap-2">
        <div className="flex h-44 flex-col justify-between text-right text-[0.7rem] text-slate-400">
          {["8h", "6h", "4h", "2h", "0h"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative flex h-44 items-end justify-around border-b border-slate-100">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} aria-hidden className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ top: `${i * 25}%` }} />
          ))}
          {WEEK.map((day, i) => (
            <span
              key={day}
              aria-hidden
              className={cn("h-1.5 w-2.5 rounded-full", i === today ? "bg-brand-orange/50" : "bg-slate-200")}
            />
          ))}
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-medium text-slate-400">
            No learning activity yet this week
          </p>
        </div>
      </div>
      <div className="ml-10 mt-2 flex justify-around text-xs text-slate-400">
        {WEEK.map((day, i) => (
          <span key={day} className={cn(i === today && "font-bold text-brand-orange-dark")}>
            {day}
          </span>
        ))}
      </div>
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
