import Image from "next/image";
import { BadgeCheck } from "lucide-react";

type CertificateProps = {
  recipientName: string;
  certificateName: string;
  courseTitle: string;
  issuedAt: Date;
  code: string;
  /** e.g. "moresootech.vercel.app", printed so anyone can check the certificate. */
  verifyHost: string;
};

/** Printable certificate. Landscape, brand colours, verification code in the footer. */
export function CertificateCard({ recipientName, certificateName, courseTitle, issuedAt, code, verifyHost }: CertificateProps) {
  return (
    <div className="relative mx-auto aspect-[1.414/1] w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-[3%] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] print:rounded-none print:shadow-none">
      {/* Decorative frame and corners */}
      <div aria-hidden className="absolute inset-[2%] rounded-2xl border-2 border-brand-blue/15" />
      <div aria-hidden className="absolute inset-[3.2%] rounded-xl border border-brand-orange/25" />
      <div aria-hidden className="absolute -left-16 -top-16 size-56 rounded-full bg-brand-blue/[0.06]" />
      <div aria-hidden className="absolute -bottom-20 -right-12 size-64 rounded-full bg-brand-orange/[0.08]" />

      <div className="relative flex h-full flex-col items-center justify-between px-[6%] py-[3%] text-center">
        <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} className="h-[clamp(2.5rem,9vw,5rem)] w-auto" priority />

        <div>
          <p className="text-[clamp(0.6rem,1.4vw,0.85rem)] font-bold uppercase tracking-[0.3em] text-brand-orange-dark">Certificate of completion</p>
          <p className="mt-[clamp(0.25rem,1vw,0.75rem)] text-[clamp(0.65rem,1.5vw,0.95rem)] text-slate-500">This certifies that</p>
          <p className="mt-[clamp(0.25rem,1vw,0.5rem)] font-heading text-[clamp(1.4rem,5vw,3.25rem)] font-bold leading-tight text-[#0f1b2d]">{recipientName}</p>
          <div aria-hidden className="mx-auto mt-[clamp(0.25rem,1vw,0.75rem)] h-0.5 w-2/3 bg-gradient-to-r from-transparent via-brand-orange to-transparent" />
          <p className="mt-[clamp(0.4rem,1.4vw,1rem)] text-[clamp(0.65rem,1.5vw,0.95rem)] text-slate-500">has successfully completed</p>
          <p className="mt-1 text-[clamp(0.85rem,2.6vw,1.6rem)] font-bold text-brand-blue">{certificateName}</p>
          {certificateName !== courseTitle && <p className="mt-0.5 text-[clamp(0.6rem,1.3vw,0.85rem)] text-slate-500">{courseTitle}</p>}
        </div>

        <div className="flex w-full items-end justify-between gap-4 text-left text-[clamp(0.55rem,1.2vw,0.8rem)] text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">{issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Date issued</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <BadgeCheck className="size-[clamp(1.5rem,4vw,2.75rem)] text-emerald-500" />
            <p className="mt-0.5 font-bold uppercase tracking-wider text-emerald-700">Verified</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-slate-800">{code}</p>
            <p>Verify at {verifyHost}/verify/{code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
