import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Plus, Search, Sparkles } from "lucide-react";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import type { ScholarshipStatus } from "@/db/schema";
import { LEVEL_LABELS, STATUS_LABELS } from "@/lib/scholarship-labels";
import { listAllScholarships } from "@/lib/scholarships";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";
import { SavedToast } from "./saved-toast";

export const metadata: Metadata = {
  title: "Scholarships | Back office",
};

const STATUS_STYLES: Record<ScholarshipStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-50 text-emerald-700",
  closed: "bg-red-50 text-red-600",
};

const TABS: { label: string; status?: ScholarshipStatus }[] = [
  { label: "All" },
  { label: "Published", status: "published" },
  { label: "Drafts", status: "draft" },
  { label: "Closed", status: "closed" },
];

export default async function AdminScholarshipsPage({ searchParams }: PageProps<"/admin/scholarships">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const q = one(params.q)?.slice(0, 100);
  const statusParam = one(params.status);
  const status = statusParam && statusParam in STATUS_LABELS ? (statusParam as ScholarshipStatus) : undefined;

  const items = await listAllScholarships({ q, status });

  const tabHref = (s?: ScholarshipStatus) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const query = p.toString();
    return query ? `/admin/scholarships?${query}` : "/admin/scholarships";
  };

  return (
    <div className="space-y-6">
      <SavedToast title={one(params.saved)} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Scholarships</h2>
          <p className="mt-1 text-sm text-slate-500">Create, publish and manage the scholarships students see.</p>
        </div>
        <Link
          href="/admin/scholarships/new"
          className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-auto"
        >
          <Plus className="size-4" /> New scholarship
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex w-fit rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tabHref(tab.status)}
              aria-current={status === tab.status ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold transition",
                status === tab.status ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form role="search" className="relative w-full lg:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="admin-scholarship-search" className="sr-only">
            Search scholarships
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-scholarship-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title, provider, university"
            className="h-11 w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.04)] outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-brand-blue/30"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-full px-6 py-3.5 font-semibold">Scholarship</th>
                  <th className="hidden px-4 py-3.5 font-semibold xl:table-cell">Level</th>
                  <th className="px-4 py-3.5 font-semibold">Deadline</th>
                  <th className="hidden px-4 py-3.5 font-semibold sm:table-cell">Status</th>
                  <th className="w-12 px-4 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="max-w-0 px-6 py-4">
                      <Link href={`/admin/scholarships/${s.id}/edit`} className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-blue">
                        <span className="truncate">{s.title}</span>
                        {s.featured && <Sparkles aria-label="Featured" className="size-3.5 shrink-0 text-brand-orange" />}
                      </Link>
                      <p className="truncate text-xs text-slate-500">{s.university ? `${s.university} · ${s.provider}` : s.provider}</p>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-slate-600 xl:table-cell">{LEVEL_LABELS[s.level]}</td>
                    <td className="px-4 py-4">
                      <DeadlineChip deadline={s.deadline} />
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[s.status])}>{STATUS_LABELS[s.status]}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <RowActions id={s.id} title={s.title} slug={s.slug} status={s.status} featured={s.featured} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <GraduationCap className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{q || status ? "Nothing matches" : "No scholarships yet"}</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {q || status ? "Try another search or status." : "Add your first scholarship. It stays a draft until you publish it."}
            </p>
            {!q && !status && (
              <Link
                href="/admin/scholarships/new"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
              >
                <Plus className="size-4" /> New scholarship
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
