import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { CertificateCard } from "@/components/learning/certificate";
import { verifyCertificate } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Verify a certificate | MoreSo Tech",
  robots: { index: false },
};

/** Public page: lets universities and embassies confirm a MoreSo Tech certificate is genuine. */
export default async function VerifyPage({ params }: PageProps<"/verify/[code]">) {
  const { code } = await params;
  const host = (await headers()).get("host") ?? "moresotech";
  const cert = await verifyCertificate(code.toUpperCase());

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center bg-[#f4f6f9] px-4 py-10">
      <Link href="/" aria-label="MoreSo Tech">
        <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} className="h-14 w-auto" priority />
      </Link>

      {cert ? (
        <div className="mt-8 w-full max-w-4xl space-y-6">
          <div role="status" className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-200">
            <BadgeCheck className="size-7 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">This certificate is genuine</p>
              <p className="text-sm">
                Issued by MoreSo Tech to {cert.recipientName} on {cert.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
              </p>
            </div>
          </div>
          <CertificateCard recipientName={cert.recipientName} certificateName={cert.certificateName} courseTitle={cert.courseTitle} issuedAt={cert.issuedAt} code={cert.code} verifyHost={host} />
        </div>
      ) : (
        <div role="alert" className="mt-10 flex max-w-md flex-col items-center rounded-3xl bg-white px-6 py-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">No certificate found</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            We couldn&apos;t find a MoreSo Tech certificate with the code <span className="font-mono font-semibold text-slate-700">{code}</span>. Check the code
            and try again. If it still doesn&apos;t match, the certificate may not be genuine.
          </p>
        </div>
      )}
    </div>
  );
}
