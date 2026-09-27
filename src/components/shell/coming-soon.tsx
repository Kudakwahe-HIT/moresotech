import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

/** Placeholder for sidebar sections that aren't built yet. */
export function ComingSoon({ label, backHref, backLabel }: { label: string; backHref: string; backLabel: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-dark ring-8 ring-brand-orange/[0.05]">
        <Construction className="size-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-900">{label} is coming soon</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        We&apos;re building this part of MoreSo Tech. Check back soon.
      </p>
      <Link
        href={backHref}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
    </div>
  );
}
