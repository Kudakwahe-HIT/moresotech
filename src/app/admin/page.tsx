import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { count, desc, eq, sql } from "drizzle-orm";
import { ArrowRight, FilePen, GraduationCap, Plus, Timer, Users, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/shell/user-avatar";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { profiles, scholarships } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/scholarship-labels";
import { listClosingSoon } from "@/lib/scholarships";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Back office | MoreSo Tech",
};

const ROLE_STYLES = {
  student: "bg-slate-100 text-slate-600",
  instructor: "bg-violet-50 text-violet-700",
  admin: "bg-brand-orange/10 text-brand-orange-dark",
};

export default async function AdminOverviewPage() {
  const [[students], [published], [drafts], [closingThisMonth], recentSignups, closingSoon] = await Promise.all([
    db.select({ n: count() }).from(profiles).where(eq(profiles.role, "student")),
    db.select({ n: count() }).from(scholarships).where(eq(scholarships.status, "published")),
    db.select({ n: count() }).from(scholarships).where(eq(scholarships.status, "draft")),
    db
      .select({ n: count() })
      .from(scholarships)
      .where(
        sql`${scholarships.status} = 'published' and ${scholarships.deadline} between current_date and current_date + 30`,
      ),
    db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(6),
    listClosingSoon(5),
  ]);

  const stats: { label: string; value: number; hint: string; icon: LucideIcon; tone: string; href?: string }[] = [
    { label: "Students", value: students.n, hint: "Registered learners", icon: Users, tone: "bg-brand-blue/10 text-brand-blue" },
    {
      label: "Live scholarships",
      value: published.n,
      hint: "Visible to students",
      icon: GraduationCap,
      tone: "bg-emerald-500/10 text-emerald-600",
      href: "/admin/scholarships?status=published",
    },
    {
      label: "Drafts",
      value: drafts.n,
      hint: "Not yet published",
      icon: FilePen,
      tone: "bg-slate-500/10 text-slate-600",
      href: "/admin/scholarships?status=draft",
    },
    {
      label: "Closing in 30 days",
      value: closingThisMonth.n,
      hint: "Published deadlines",
      icon: Timer,
      tone: "bg-brand-orange/10 text-brand-orange-dark",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h2>
          <p className="mt-1 text-sm text-slate-500">What&apos;s happening across MoreSo Tech today.</p>
        </div>
        <Link
          href="/admin/scholarships/new"
          className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-auto"
        >
          <Plus className="size-4" /> New scholarship
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const body = (
            <>
              <div className={cn("flex size-11 items-center justify-center rounded-full", stat.tone)}>
                <stat.icon className="size-5" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{stat.label}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
            </>
          );
          const cls = "rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={cn(cls, "transition hover:-translate-y-0.5 hover:shadow-md")}>
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={cls}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Closing soon" action={{ href: "/admin/scholarships", label: "All scholarships" }}>
          {closingSoon.length ? (
            <ul className="divide-y divide-slate-100">
              {closingSoon.map((s) => (
                <li key={s.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/scholarships/${s.id}/edit`} className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-blue">
                      {s.title}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {s.provider} · closes {formatDate(s.deadline, "short")}
                    </p>
                  </div>
                  <DeadlineChip deadline={s.deadline} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No published scholarships with an upcoming deadline.</Empty>
          )}
        </Panel>

        <Panel title="Newest members">
          {recentSignups.length ? (
            <ul className="divide-y divide-slate-100">
              {recentSignups.map((p) => {
                const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email;
                return (
                  <li key={p.id} className="flex items-center gap-3.5 px-6 py-3.5">
                    <UserAvatar imageUrl={p.imageUrl ?? ""} hasImage={Boolean(p.imageUrl)} name={name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                      <p className="truncate text-xs text-slate-500">{p.email}</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", ROLE_STYLES[p.role])}>{p.role}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No members yet.</Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {action && (
          <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
            {action.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="px-6 pb-8 pt-4 text-sm text-slate-500">{children}</p>;
}
