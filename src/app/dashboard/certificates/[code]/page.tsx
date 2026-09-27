import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { CertificateActions } from "@/components/learning/certificate-actions";
import { CertificateCard } from "@/components/learning/certificate";
import { certificates, courses } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Certificate | MoreSo Tech",
};

export default async function CertificatePage({ params }: PageProps<"/dashboard/certificates/[code]">) {
  const { code } = await params;
  const host = (await headers()).get("host") ?? "moresotech";
  const profile = await requireRole("student");
  const [row] = await db
    .select({ certificate: certificates, courseTitle: courses.title })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(and(eq(certificates.code, code), eq(certificates.profileId, profile.id)))
    .limit(1);
  if (!row) notFound();
  const c = row.certificate;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/courses?tab=certificates" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 print:hidden">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> My certificates
      </Link>
      <CertificateCard recipientName={c.recipientName} certificateName={c.certificateName} courseTitle={row.courseTitle} issuedAt={c.issuedAt} code={c.code} verifyHost={host} />
      <CertificateActions code={c.code} />
      <p className="text-center text-xs text-slate-400 print:hidden">
        Anyone with the verification link can confirm this certificate is genuine. It shows only what&apos;s printed on it.
      </p>
    </div>
  );
}
