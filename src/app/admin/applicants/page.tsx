import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/applications/badges";
import { UserAvatar } from "@/components/shell/user-avatar";
import type { ApplicationStatus } from "@/db/schema";
import { APPLICATION_STATUS, formatDateTime } from "@/lib/application-rules";
import { listApplicationsForAdmin, type AdminApplicationFilter } from "@/lib/applications";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Applicants | Back office",
};

const TABS: { label: string; value: AdminApplicationFilter }[] = [
  { label: "Needs review", value: "needs_review" },
  { label: "All", value: undefined },
  { label: "In progress", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Not successful", value: "rejected" },
];

export default async function ApplicantsPage({ searchParams }: PageProps<"/admin/applicants">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const q = one(params.q)?.slice(0, 100);
  const raw = one(params.filter);
  // Default view is the work queue.
  const filter: AdminApplicationFilter =
    raw === "all" ? undefined : raw && raw in APPLICATION_STATUS ? (raw as ApplicationStatus) : "needs_review";

  const rows = await listApplicationsForAdmin(filter, q);

  const tabHref = (value: AdminApplicationFilter) => {
    const p = new URLSearchParams();
    p.set("filter", value ?? "all");
    if (q) p.set("q", q);
    return `/admin/applicants?${p}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Applicants</h2>
        <p className="mt-1 text-sm text-slate-500">Verify documents and assess applications.</p>
      </div>

      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <nav aria-label="Filter applications" className="flex w-fit max-w-full overflow-x-auto rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tabHref(tab.value)}
              aria-current={filter === tab.value ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition",
                filter === tab.value ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form role="search" className="relative w-full 2xl:w-80">
          <input type="hidden" name="filter" value={filter ?? "all"} />
          <label htmlFor="applicant-search" className="sr-only">
            Search applicants
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="applicant-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email or scholarship"
            className="h-11 w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.04)] outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-brand-blue/30"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="w-full px-6 py-3.5 font-semibold">Applicant</th>
                <th className="hidden px-4 py-3.5 font-semibold lg:table-cell">Documents</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="hidden px-6 py-3.5 font-semibold xl:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ application: app, scholarship: s, student, progress }) => {
                const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email;
                return (
                  <tr key={app.id} className="relative transition-colors hover:bg-slate-50/60">
                    <td className="max-w-0 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar imageUrl={student.imageUrl ?? ""} hasImage={Boolean(student.imageUrl)} name={name} size={36} />
                        <div className="min-w-0">
                          {/* Stretched link makes the whole row clickable. */}
                          <Link href={`/admin/applicants/${app.id}`} className="block truncate font-semibold text-slate-900 after:absolute after:inset-0 hover:text-brand-blue">
                            {name}
                          </Link>
                          <p className="truncate text-xs text-slate-500">{s.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 lg:table-cell">
                      <span className="font-semibold text-slate-800">{progress.verified}</span>
                      <span className="text-slate-400">/{progress.total} verified</span>
                      {progress.pending > 0 && (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{progress.pending} to review</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-xs text-slate-500 xl:table-cell">{formatDateTime(app.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Users className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{filter === "needs_review" && !q ? "You're all caught up" : "No applications found"}</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {filter === "needs_review" && !q ? "New uploads and submissions will appear here." : "Try another filter or search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
