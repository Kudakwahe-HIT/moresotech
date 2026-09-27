import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkCheck, GraduationCap, SearchX } from "lucide-react";
import { FilterBar } from "@/components/scholarships/filter-bar";
import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import { requireRole } from "@/lib/auth";
import { listPublishedScholarships, parseFilters } from "@/lib/scholarships";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Scholarships | MoreSo Tech",
};

export default async function ScholarshipsPage({ searchParams }: PageProps<"/dashboard/scholarships">) {
  const profile = await requireRole("student", "instructor", "admin");
  const params = await searchParams;
  const filters = parseFilters(params);
  const view = params.view === "saved" ? "saved" : "all";

  const items = await listPublishedScholarships(
    { ...filters, savedBy: view === "saved" ? profile.id : undefined },
    profile.id,
  );
  const filtered = Boolean(filters.q || filters.level || filters.funding);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Scholarships</h2>
          <p className="mt-1 text-sm text-slate-500">
            Current scholarships to study in South Korea, checked by the MoreSo Tech team.
          </p>
        </div>
        <nav aria-label="Scholarship lists" className="flex rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {(["all", "saved"] as const).map((tab) => (
            <Link
              key={tab}
              href={tab === "saved" ? "/dashboard/scholarships?view=saved" : "/dashboard/scholarships"}
              aria-current={view === tab ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition",
                view === tab ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {tab === "saved" && <BookmarkCheck className="size-4" />}
              {tab === "all" ? "All scholarships" : "Saved"}
            </Link>
          ))}
        </nav>
      </div>

      <FilterBar filters={{ ...filters, view: view === "saved" ? "saved" : undefined }} />

      <p className="text-sm text-slate-500" aria-live="polite">
        {items.length} {items.length === 1 ? "scholarship" : "scholarships"}
        {filtered ? " match your filters" : view === "saved" ? " saved" : " available"}
      </p>

      {items.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
            {filtered ? <SearchX className="size-7" /> : view === "saved" ? <BookmarkCheck className="size-7" /> : <GraduationCap className="size-7" />}
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {filtered ? "No scholarships match" : view === "saved" ? "Nothing saved yet" : "Scholarships coming soon"}
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
            {filtered
              ? "Try a different search or clear the filters."
              : view === "saved"
                ? "Tap the bookmark on any scholarship to keep it here."
                : "Our team is verifying the latest scholarships. They'll appear here as soon as they're published."}
          </p>
        </div>
      )}
    </div>
  );
}
