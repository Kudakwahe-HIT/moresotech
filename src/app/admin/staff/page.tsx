import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { Search, ShieldCheck, UserCog } from "lucide-react";
import { UserAvatar } from "@/components/shell/user-avatar";
import { profiles, type Role } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { RoleSelect } from "./role-select";

export const metadata: Metadata = {
  title: "Staff & roles | Back office",
};

const FILTERS: { label: string; value?: Role }[] = [
  { label: "Staff", value: undefined },
  { label: "Students", value: "student" },
];

export default async function StaffPage({ searchParams }: PageProps<"/admin/staff">) {
  const me = await requireRole("admin");
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 100);
  const showStudents = params.view === "students";

  const conditions: SQL[] = [showStudents ? eq(profiles.role, "student") : sql`${profiles.role} in ('admin', 'instructor')`];
  if (q) {
    const term = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conditions.push(or(ilike(profiles.email, term), ilike(profiles.firstName, term), ilike(profiles.lastName, term))!);
  }
  const rows = await db
    .select()
    .from(profiles)
    .where(sql.join(conditions, sql` and `))
    .orderBy(showStudents ? desc(profiles.createdAt) : asc(profiles.role), asc(profiles.firstName))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Staff & roles</h2>
        <p className="mt-1 text-sm text-slate-500">
          Only admins can add instructors and admins. To add someone, ask them to sign up, then find them under Students and change their role.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter members" className="flex w-fit rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {FILTERS.map((f) => {
            const active = (f.value === "student") === showStudents;
            return (
              <Link
                key={f.label}
                href={f.value ? "/admin/staff?view=students" : "/admin/staff"}
                aria-current={active ? "page" : undefined}
                className={cn("inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold transition", active ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900")}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
        <form role="search" className="relative w-full lg:w-80">
          {showStudents && <input type="hidden" name="view" value="students" />}
          <label htmlFor="staff-search" className="sr-only">
            Search members
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="staff-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="h-11 w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.04)] outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-brand-blue/30"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map((p) => {
              const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-3.5">
                  <UserAvatar imageUrl={p.imageUrl ?? ""} hasImage={Boolean(p.imageUrl)} name={name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-900">
                      {name}
                      {p.id === me.id && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-500">You</span>}
                    </p>
                    <p className="truncate text-xs text-slate-500">{p.email}</p>
                  </div>
                  <RoleSelect profileId={p.id} role={p.role} name={name} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              {showStudents ? <UserCog className="size-7" /> : <ShieldCheck className="size-7" />}
            </div>
            <p className="mt-4 font-bold text-slate-900">No one found</p>
            <p className="mt-1 text-sm text-slate-500">Try another search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
