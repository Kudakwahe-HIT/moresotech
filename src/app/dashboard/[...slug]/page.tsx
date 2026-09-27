import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { NAV_ITEMS } from "../_components/nav-items";

export const metadata: Metadata = {
  title: "Coming soon | MoreSo Tech",
};

/** Placeholder for sidebar sections that aren't built yet. Unknown paths still 404. */
export default async function ComingSoonPage({ params }: PageProps<"/dashboard/[...slug]">) {
  const { slug } = await params;
  const item = NAV_ITEMS.find((nav) => nav.href === `/dashboard/${slug.join("/")}`);
  if (!item) notFound();

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-dark ring-8 ring-brand-orange/[0.05]">
        <Construction className="size-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-900">{item.label} is coming soon</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        We&apos;re building this part of MoreSo Tech. Check back soon.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
    </div>
  );
}
