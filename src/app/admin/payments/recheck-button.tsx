"use client";

import { useTransition } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { recheckPayment } from "./actions";

export function RecheckButton({ paymentId }: { paymentId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await recheckPayment(paymentId);
          if (r.error) toast.error(r.error);
          else toast.success("Status updated from Pesepay");
        })
      }
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Recheck
    </button>
  );
}
