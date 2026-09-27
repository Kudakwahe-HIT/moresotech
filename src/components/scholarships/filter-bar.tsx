"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowUpDown, CircleDollarSign, GraduationCap, LoaderCircle, Search, X } from "lucide-react";
import { Dropdown } from "@/components/forms/dropdown";
import { FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";

type Filters = { q?: string; level?: string; funding?: string; sort?: string; view?: string };

/** Search + filter controls. State lives in the URL, so results are shareable and survive refresh. */
export function FilterBar({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q ?? "");

  function apply(next: Partial<Filters>) {
    const params = new URLSearchParams();
    const merged = { ...filters, q, ...next };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "sort" && value === "deadline")) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  function onSearch(event: FormEvent) {
    event.preventDefault();
    apply({ q });
  }

  const hasFilters = Boolean(filters.q || filters.level || filters.funding);

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] xl:flex-row xl:items-center">
      <form role="search" onSubmit={onSearch} className="relative flex-1">
        <label htmlFor="scholarship-search" className="sr-only">
          Search scholarships
        </label>
        {pending ? (
          <LoaderCircle aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand-blue" />
        ) : (
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id="scholarship-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, university or provider"
          className="h-11 w-full rounded-2xl bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-brand-blue/30"
        />
      </form>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">
        <Dropdown
          variant="soft"
          aria-label="Study level"
          icon={<GraduationCap className="size-4" />}
          value={filters.level ?? ALL}
          active={Boolean(filters.level)}
          onValueChange={(level) => apply({ level: level === ALL ? "" : level })}
          options={[{ value: ALL, label: "All levels" }, ...toOptions(LEVEL_LABELS)]}
          className="xl:w-44"
        />
        <Dropdown
          variant="soft"
          aria-label="Funding"
          icon={<CircleDollarSign className="size-4" />}
          value={filters.funding ?? ALL}
          active={Boolean(filters.funding)}
          onValueChange={(funding) => apply({ funding: funding === ALL ? "" : funding })}
          options={[{ value: ALL, label: "Any funding" }, ...toOptions(FUNDING_LABELS)]}
          className="xl:w-44"
        />
        <Dropdown
          variant="soft"
          aria-label="Sort by"
          icon={<ArrowUpDown className="size-4" />}
          value={filters.sort ?? "deadline"}
          onValueChange={(sort) => apply({ sort })}
          options={[
            { value: "deadline", label: "Deadline soonest" },
            { value: "newest", label: "Newest first" },
            { value: "title", label: "A–Z" },
          ]}
          className="xl:w-52"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            apply({ q: "", level: "", funding: "" });
          }}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="size-4" /> Clear
        </button>
      )}
    </div>
  );
}

/** Base UI treats "" as "nothing selected", so the "All" option needs a real value. */
const ALL = "all";

const toOptions = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
