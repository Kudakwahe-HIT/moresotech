"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";
import { cn } from "@/lib/utils";

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

      <div className="grid grid-cols-3 gap-2 xl:flex">
        <Select label="Level" value={filters.level ?? ""} onChange={(level) => apply({ level })} options={LEVEL_LABELS} allLabel="All levels" />
        <Select
          label="Funding"
          value={filters.funding ?? ""}
          onChange={(funding) => apply({ funding })}
          options={FUNDING_LABELS}
          allLabel="Any funding"
        />
        <Select
          label="Sort"
          value={filters.sort ?? "deadline"}
          onChange={(sort) => apply({ sort })}
          options={{ deadline: "Deadline soonest", newest: "Newest", title: "A–Z" }}
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

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  allLabel?: string;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none rounded-2xl bg-slate-50 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-brand-blue/30 xl:w-auto",
          value && allLabel && "bg-brand-blue/5 text-brand-blue",
        )}
      >
        {allLabel && <option value="">{allLabel}</option>}
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400">
        <path fill="currentColor" d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
      </svg>
    </label>
  );
}
