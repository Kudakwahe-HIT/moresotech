import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/shell/coming-soon";
import { ADMIN_NAV } from "@/components/shell/nav-items";

/** Back-office sections that aren't built yet. Unknown paths still 404. */
export default async function AdminComingSoonPage({ params }: PageProps<"/admin/[...slug]">) {
  const { slug } = await params;
  const item = ADMIN_NAV.find((nav) => nav.href === `/admin/${slug.join("/")}`);
  if (!item) notFound();
  return <ComingSoon label={item.label} backHref="/admin" backLabel="Back to overview" />;
}
