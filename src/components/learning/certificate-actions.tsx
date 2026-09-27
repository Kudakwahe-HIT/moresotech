"use client";

import { Copy, Printer } from "lucide-react";
import { toast } from "sonner";

/** Print (browser "Save as PDF" works too) and copy the public verification link. */
export function CertificateActions({ code }: { code: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark"
      >
        <Printer className="size-4" /> Print or save as PDF
      </button>
      <button
        type="button"
        onClick={async () => {
          const url = `${window.location.origin}/verify/${code}`;
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Verification link copied", { description: url });
          } catch {
            toast.message("Verification link", { description: url });
          }
        }}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Copy className="size-4" /> Copy verification link
      </button>
    </div>
  );
}
