import Link from "next/link";
import { Building2, GraduationCap, Sparkles } from "lucide-react";
import type { Scholarship } from "@/db/schema";
import { FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";
import { DeadlineChip } from "./deadline-chip";
import { SaveButton } from "./save-button";

export function ScholarshipCard({ scholarship: s }: { scholarship: Scholarship & { saved: boolean } }) {
  return (
    <article className="group relative flex flex-col rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] hover:ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
          <GraduationCap className="size-6" />
        </div>
        <SaveButton scholarshipId={s.id} title={s.title} saved={s.saved} />
      </div>

      {s.featured && (
        <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-brand-orange-dark">
          <Sparkles className="size-3" /> Featured
        </span>
      )}

      <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">
        {/* Stretched link: the whole card is clickable, the bookmark stays its own button. */}
        <Link href={`/dashboard/scholarships/${s.slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none">
          {s.title}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <Building2 className="size-3.5 shrink-0" />
        <span className="truncate">{s.university ?? s.provider}</span>
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{s.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{LEVEL_LABELS[s.level]}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {FUNDING_LABELS[s.fundingType]}
        </span>
        <DeadlineChip deadline={s.deadline} className="ml-auto" />
      </div>
    </article>
  );
}
