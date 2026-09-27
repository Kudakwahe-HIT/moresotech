import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/shell/coming-soon";
import { STUDENT_NAV } from "@/components/shell/nav-items";

export const metadata: Metadata = {
  title: "Coming soon | MoreSo Tech",
};

/** Sidebar sections that aren't built yet. Unknown paths still 404. */
export default async function ComingSoonPage({ params }: PageProps<"/dashboard/[...slug]">) {
  const { slug } = await params;
  const item = STUDENT_NAV.find((nav) => nav.href === `/dashboard/${slug.join("/")}`);
  if (!item) notFound();
  return <ComingSoon label={item.label} backHref="/dashboard" backLabel="Back to dashboard" />;
}
